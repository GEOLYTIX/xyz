/**
## /workspace
The Workspace API module exports the getKeyMethod() which returns a method from the keyMethods{} object.

@requires /workspace/cache
@requires /workspace/getLocale
@requires /workspace/getLayer
@requires /workspace/getTemplate
@requires crypto

@module /workspace
*/

/**
@global
@typedef {object} workspace
The workspace object defines the mapp resources available in an XYZ instance.
@property {object} [roles] Each property of the roles object is a role which can be assigned to a user.
@property {string} [dbs] The fallback dbs connection if not implicit in [query] template.
@property {object} locale The default locale which serves as a templates for all locales in workspace.
@property {object} locales Each property in the locales object is a locale available from this workspace.
@property {template} templates Each property in the templates object is a global template typedef.
*/

import { createHash } from 'node:crypto';
import envReplace from '../utils/envReplace.js';
import logger from '../utils/logger.js';
import workspaceCache from './cache.js';
import getLayer from './getLayer.js';
import getLocale from './getLocale.js';
import getTemplate from './getTemplate.js';

const keyMethods = {
  layer,
  locale,
  locales,
  scopes,
  test,
};

let workspace;

/**
@function getKeyMethod
@async

@description
The cached workspace requested from the workspaceCache() will be assigned to the workspace variable declared in the module scope.

The method checks whether the req.params.key matches a keyMethods property and returns the matching method.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {string} params.key Workspace API method requested.
*/
export default async function getKeyMethod(req, res) {
  workspace = await workspaceCache();

  if (workspace instanceof Error) {
    return res
      .status(500)
      .setHeader('Content-Type', 'text/plain')
      .send('Failed to load workspace.');
  }

  // The keys object must own a user provided lookup key
  if (!Object.hasOwn(keyMethods, req.params.key)) {
    return res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(`Failed to evaluate '${req.params.key}' param.`);
  }

  return keyMethods[req.params.key](req, res);
}

/**
@function layer
@async

@description
The method requests a JSON layer from the getLayer module.

The layer is checked for user role access and will return an error if access is denied.

All role information is removed from the layer before being returned to the client.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {string} [params.locale] Locale key.
@property {string} params.layer Layer key.
@property {Object} [params.user] User requesting the layer.

@returns {res} The HTTP response with either an error.message or the JSON layer.
*/
async function layer(req, res) {
  const layer = await getLayer(req.params);

  if (layer instanceof Error) {
    return res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(layer.message);
  }

  res.send(layer);
}

/**
@function locale
@async

@description
The method requests a JSON locale from the getLocale module.

The getLocale method will load all layers in the locale and check for user role access with the boolean layers property in the request params.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {string} [params.locale] Locale key.
@property {boolean} [params.layers] Whether layer objects should be returned with the locale.
@property {Object} [params.user] User requesting the locale.

@returns {res} The HTTP response with either an error.message or the JSON locale.
*/
async function locale(req, res) {
  const locale = await getLocale(req.params);

  if (locale instanceof Error) {
    res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(locale.message);
    return;
  }

  assignChecksum(locale);

  res.send(locale);
}

/**
@function locales
@async

@description
The locales method returns an array of fully resolved locale objects from the workspace.

Each locale is retrieved via the getLocale method, which merges templates and applies proper role-based access control. Any locales that return errors (e.g., due to access restrictions) are filtered out of the response.

The nestedLocales method will be returned if a locale property is provided in the request params.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {string} [params.locale] Request nested locales for the locale.
@property {Object} [params.user] User requesting the locales.
*/
async function locales(req, res) {
  if (req.params.locale) {
    await getNestedLocales(req, res);
    return;
  }

  const locales = [];

  for (const localeKey of Object.keys(workspace.locales)) {
    const locale = await getLocale({
      user: req.params.user,
      locale: localeKey,
      roles: req.params.user?.roles,
    });

    if (locale instanceof Error) continue;

    locales.push({
      key: locale.key,
      name: locale.name,
      locales: locale.locales,
    });
  }

  res.send(locales);
}

/**
@function getNestedLocales
@async

@description
The getNestedLocales is returned if the locales method is called with a locale
property.

The locale will be requested from the getLocale module. An array of nested
locales defined in the locales property of the locale is checked for user access.

Nested locales accessible to the user are returned. The key for a nested locale
is an array left to right. For `[UK,London]` the London locale will be nested
in the UK locale. The name for a nested locale will be concatenated like so
`UK/London`.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {string} params.locale Request nested locales for the locale.
@property {Object} [params.user] User requesting the locales.
*/
async function getNestedLocales(req, res) {
  // The locale property is required for nested locales.
  if (!req.params.locale) return;

  const locale = await getLocale(req.params);

  if (locale instanceof Error) {
    return res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(locale.message);
  }

  const nestedLocales = [];

  if (!Array.isArray(locale.locales)) {
    res.send(nestedLocales);
    return;
  }

  for (const key of locale.locales) {
    const nestedLocale = await getLocale(
      { ...req.params, locale: key },
      structuredClone(locale),
    );

    if (nestedLocale instanceof Error) continue;

    nestedLocales.push({
      key: Array.isArray(nestedLocale.key)
        ? nestedLocale.key.join(',')
        : nestedLocale.key,
      name: `${nestedLocale.name || key}`,
      locales: nestedLocale.locales,
    });
  }

  res.send(nestedLocales);
}

/**
@function scopes
@async

@description
The scopes method returns an array of scopes which are the templateScopes assigned to each template in the workspace.templates{} object.

@param {req} req HTTP request.
@param {res} res HTTP response.

@property {Object} req.params HTTP request parameter.
@property {Object} params.user User requesting the scopes.
@property {boolean} params.user.admin Whether user has admin privileges (required).
*/
async function scopes(req, res) {
  if (!req.params.user?.admin) {
    res
      .status(403)
      .send(`Admin credentials are required to test the workspace sources.`);
    return;
  }

  const cachedWorkspace = await workspaceCache(true);

  // TODO test workspace without locales property. Should the scopes method still return the scopes of the templates in the workspace.templates object?
  for (const localeKey of Object.keys(cachedWorkspace.locales)) {
    const locale = await getLocale({
      locale: localeKey,
      layers: true,
      user: { roles: true },
    });
    await nestedLocales(locale, { roles: true });
  }

  const scopesStringsSet = new Set();

  cachedWorkspace.scopes.forEach((scope) => {
    if (!Array.isArray(scope)) return;
    scopesStringsSet.add(scope.filter(Boolean).join('.'));
  });

  const scopesArray = Array.from(scopesStringsSet)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  //TODO: Should the scopesArray be filtered for user roles? If so, how should that be implemented?
  //   for (const role of rolesSet) {
  //     const rolesArr = role.split('.');

  //     if (rolesArr.length > 1) {
  //       rolesArr.reduce(
  //         (accumulator, currentValue) => (accumulator[currentValue] ??= {}),
  //         rolesTree,
  //       );

  //       for (const role of rolesArr) {
  //         rolesSet.add(role);
  //       }
  //     } else {
  //       rolesTree[role] ??= {};
  //     }
  //   }

  res.send(scopesArray);
}

/**
@function nestedLocales
@async

@description
The nestedLocales method iterates the locale.locales array property and requests each nested locale from the getLocale method.

The nestedLocales method is called recursively to check for further nested locales.

@param {Object} locale The locale object.
@param {Object} user The user requesting the nested locales.
@property {Array} [locale.locales] An array of nested locale keys.
*/
async function nestedLocales(locale, user) {
  if (!Array.isArray(locale.locales)) return;

  const keys = locale.keys ?? [locale.key];
  for (const localeKey of locale.locales) {
    // TODO it should be possible to provide the locale as parentLocale to avoid re-composing the parent locale for each nested locale. This would require a change to the getLocale method to accept a parentLocale parameter.
    const nestedLocale = await getLocale({
      locale: [...keys, localeKey],
      layers: true,
      user,
    });

    await nestedLocales(nestedLocale, user);
  }
}

/**
@function test

@description
The workspace/test method which is only available to user with admin credentials requests all locales in workspace.

The cached workspace will be flushed for the test method.

Requesting all locales should add any additional templates to the workspace.

The test method will iterate over all workspace.templates and get from the getTemplate method to check whether any errors are logged on a template in regards to its src parameter.

A flat array of template.err will be returned from the workspace/test method.

@param {req} req HTTP request.
@param {req} res HTTP response.

@property {Object} req.params HTTP request parameter.
@property {Boolean} [params.detail] Flag to return the cached workspace.
@property {boolean} [params.force] Whether to force refresh the workspace cache.
@property {Object} params.user The user requesting the test method.
@property {Boolean} user.admin The user is required to have admin privileges.
*/
async function test(req, res) {
  if (!req.params.user?.admin) {
    res
      .status(403)
      .send(`Admin credentials are required to test the workspace sources.`);
    return;
  }

  // TODO deprecate cacheTemplates method.
  // let cache;
  // if (req.params.force) {
  //   cache = await cacheTemplates({
  //     user: req.params.user,
  //     force: req.params.force,
  //   });
  // } else {
  //   cache = workspace;
  // }

  const cachedWorkspace = await workspaceCache(true);

  const testConfig = {
    errArr: [],
    properties: new Set(['template', 'templates', 'query']),
    results: {},
    used_templates: [],
    unused_templates: [],
  };

  testConfig.workspace_templates = new Set(
    Object.entries(cachedWorkspace.templates)
      .filter(([key, value]) => value._type === 'workspace')
      .filter(([key, value]) => !value.src?.endsWith('.html'))
      .map(([key, value]) => key),
  );

  // Create clone of workspace_templates
  testConfig.unused_templates = new Set(testConfig.workspace_templates);
  testConfig.overwritten_templates = new Set();

  testWorkspaceLocales(testConfig);

  for (const [key, template] of Object.entries(cachedWorkspace.templates)) {
    if (template instanceof Error) {
      testConfig.errArr.push(`${key}: ${template.message}`);
    }

    if (template.err instanceof Error) {
      testConfig.errArr.push(`${key}: ${template.err.message}`);
    }
  }

  const results = processTestResults(testConfig);

  res.setHeader('content-type', 'application/json');

  const result = req.params.detail ? { ...results, ...workspace } : results;

  res.send(JSON.stringify(result));
}

/**
@function testWorkspaceLocales
@description
Tests all locales in the workspace for errors and analyzes template usage.

@param {Object} testConfig The test configuration object.
*/
function testWorkspaceLocales(testConfig) {
  for (const localeKey of Object.keys(workspace.locales)) {
    const locale = workspace.locales[localeKey];

    // If you can't get the locale, access is denied, add the error to the errArr.
    if (locale instanceof Error) {
      testConfig.errArr.push(`${localeKey}: ${locale.message}`);
      continue;
    }

    // If the locale has no layers, just skip it.
    if (!locale.layers) continue;

    for (const layerKey of Object.keys(locale.layers)) {
      const layer = locale.layers[layerKey];

      if (layer instanceof Error) {
        testConfig.errArr?.push(`${layerKey}: ${layer.message}`);
      }
    }

    // Test locale and all of its layers as nested object for template usage.
    templateUse(locale, testConfig);
  }
}

/**
@function templateUse

@description
Iterates through all nested object properties.
Test properties found in the test.properties Set.
Removes template keys from test.unused_templates Set.
Add template keys to test.used_templates Array.

@param {Object} obj The object to test.
@param {Object} test The test config object.
@property {Set} test.properties Set of properties to test ['template', 'templates', 'query']
@property {Set} test.workspace_templates Set of templates _type=workspace templates.
@property {Set} test.unused_templates Set of templates not (yet) used.
@property {Set} test.overwritten_templates Set of _type=workspace templates which have been overwritten.
@property {Array} test.used_templates Array of template keys for each usage.
*/
function templateUse(obj, test) {
  if (typeof obj !== 'object') return;

  Object.entries(obj).forEach((entry) => {
    // entry key === ['template', 'templates', 'query']
    if (test.properties.has(entry[0])) {
      if (Array.isArray(entry[1])) {
        entry[1]
          .filter((item) => typeof item === 'string')
          .forEach((item) => {
            test.unused_templates.delete(item);
            test.used_templates.push(item);
          });
      }

      if (typeof entry[1] === 'object' && Object.hasOwn(entry[1], 'key')) {
        if (test.workspace_templates.has(entry[1].key)) {
          test.overwritten_templates.add(entry[1].key);
        }
        return;
      }

      if (typeof entry[1] === 'string') {
        test.unused_templates.delete(entry[1]);
        test.used_templates.push(entry[1]);
      }
    }

    // Iterate through each array, eg. infoj
    if (Array.isArray(entry[1])) {
      entry[1].forEach((entry) => templateUse(entry, test));

      // Iterate through nested objects eg. layers
    } else if (entry[1] instanceof Object) {
      templateUse(entry[1], test);
    }
  });
}

/**
@function processTestResults
@description
Processes the test configuration and returns formatted results.

@param {Object} testConfig The test configuration object.
@returns {Object} Formatted test results object.
*/
function processTestResults(testConfig) {
  const results = {};

  results.errors = testConfig.errArr.flat();
  results.unused_templates = Array.from(testConfig.unused_templates);
  results.overwritten_templates = Array.from(testConfig.overwritten_templates);

  // Sort the array.
  testConfig.used_templates.sort((a, b) => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  // Reduce the test.used_templates array to count the occurrence of each template.
  results.usage = Object.fromEntries(
    testConfig.used_templates.reduce(
      (acc, e) => acc.set(e, (acc.get(e) || 0) + 1),
      new Map(),
    ),
  );

  return results;
}

/**
@function cacheWorkspaceTemplates
@async

@description
Build-time workspace cache method used by the workspace generation script. The
method lives in the workspace module so it can reuse the same workspace cache and
getTemplate behaviour as the API without going through an HTTP-only response
path.

The workspace is parsed for every non-module src property. All matching source
templates found in the current pass are cached, then only those newly cached
templates are parsed for additional src properties. This repeats until no new src
templates are discovered.

Each unique src is fetched once (de-duplicated via srcMap). References within a
circular src path are skipped to prevent infinite expansion. Module templates
keep their src because render functions cannot be serialised into JSON.

@returns {Promise<Object|Error>} Generated workspace or an Error.
*/
export async function cacheWorkspaceTemplates() {
  workspace = await workspaceCache(true);

  if (workspace instanceof Error) {
    return workspace;
  }

  const errors = [];
  const srcMap = new Map();
  const scannedSrc = new Set();
  const queue = [{ obj: workspace, srcPath: new Set() }];

  while (queue.length) {
    const srcRefs = new Map();

    for (const item of queue.splice(0)) {
      collectSrcRefs(item.obj, item.srcPath, srcRefs, new WeakSet());
    }

    for (const [src, refs] of srcRefs) {
      await inlineSrc(src, refs, srcMap, scannedSrc, errors, queue);
    }
  }

  if (errors.length) {
    return new Error(errors.join('\n'));
  }

  return workspace;
}

/**
@function inlineSrc
@async

@description
Loads the template for a single src, inlines it into every referencing object,
and queues the newly populated objects for the next BFS pass. Refs that already
contain this src in their branch path are skipped to prevent circular expansion.

@param {string} src Normalised source reference.
@param {Array} refs Objects that reference this src with their current srcPath.
@param {Map} srcMap Cache of already-loaded templates for this generation run.
@param {Set} scannedSrc Sources whose children have already been queued.
@param {Array} errors Accumulated error messages.
@param {Array} queue BFS queue for the next pass.
*/
async function inlineSrc(src, refs, srcMap, scannedSrc, errors, queue) {
  // Skip refs where this src already appears in the branch path (circular).
  const refsToExpand = refs.filter((ref) => !ref.srcPath.has(src));
  if (!refsToExpand.length) return;

  let template = srcMap.get(src);
  if (!template) {
    // getTemplate caches anonymous src objects under the src key; remove
    // that temporary entry unless the key already existed before this run.
    const hadTemplate = Object.hasOwn(workspace.templates, src);
    template = await getTemplate({ src });
    if (!hadTemplate) delete workspace.templates[src];
    srcMap.set(src, template);
  }

  if (template instanceof Error) {
    errors.push(template.message);
    return;
  }

  for (const ref of refsToExpand) {
    Object.assign(ref.obj, template);
    delete ref.obj.src;
  }

  // Only scan a src once for nested src values; repeated references in the
  // same pass are already inlined above.
  if (!scannedSrc.has(src)) {
    scannedSrc.add(src);
    queue.push(
      ...refsToExpand.map((ref) => ({
        obj: ref.obj,
        srcPath: new Set([...ref.srcPath, src]),
      })),
    );
  }
}

/**
@function collectSrcRefs

@description
Walks an object tree and groups non-module src references by normalized src
value. The object that owns the src is retained so the cached template can be
assigned back to the same location in the generated workspace.

@param {Object|Array} obj Object or array to inspect.
@param {Set<String>} srcPath Source chain for circular reference detection.
@param {Map<String, Array<Object>>} srcRefs Grouped source references.
@param {WeakSet<Object>} objects Objects already visited during this scan.
*/
function collectSrcRefs(obj, srcPath, srcRefs, objects) {
  if (!obj || typeof obj !== 'object') return;

  // Avoid walking the same object twice in one scan if objects are shared.
  if (objects.has(obj)) return;
  objects.add(obj);

  if (Array.isArray(obj)) {
    obj.forEach((item) => collectSrcRefs(item, srcPath, srcRefs, objects));
    return;
  }

  if (typeof obj.src === 'string') {
    obj.src = envReplace(obj.src);

    // Module templates stay as runtime imports; skip them entirely so nested
    // src properties inside a module object are not inlined either.
    if (obj.module) return;

    const refs = srcRefs.get(obj.src) || [];
    refs.push({ obj, srcPath });
    srcRefs.set(obj.src, refs);
  }

  Object.values(obj).forEach((value) =>
    collectSrcRefs(value, srcPath, srcRefs, objects),
  );
}

/**
@function assignChecksum

@description
The method assigns a checksum to an object.

@param {object} obj Object for the checksum
*/
function assignChecksum(obj) {
  const objString = JSON.stringify(obj, null, 0);
  obj.checksum = createHash('sha256').update(objString).digest('hex');
}
