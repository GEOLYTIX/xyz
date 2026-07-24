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

// It should not be possible to modify object prototypes
// This has been commented out because it causes issues with the vitest extension in VSCode. The extension uses Object.prototype to add a method to the object prototype which is then used in the test suite. This is not a problem in production because the extension is not used in production.
// Object.freeze(Object.prototype);

import { createHash } from 'node:crypto';
import { cacheSources } from '../provider/getSrc.js';
import logger from '../utils/logger.js';
import workspaceCache from './cache.js';
import getLayer from './getLayer.js';
import getLocale from './getLocale.js';

const keyMethods = {
  layer,
  locale,
  locales,
  scopes,
  roles: scopes, // for backwards compatibility with the workspace/roles endpoint
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
      key: Array.isArray(nestedLocale.keys)
        ? nestedLocale.keys.join(',')
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

  await cacheSources(cachedWorkspace).then((errors) => {
    if (errors.length) {
      console.error(new Error(errors.join('\n')));
    }
  });

  // The nestedLocales method will be called for each locale in the cached workspace to ensure that all nested locales are loaded and checked for user access.
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

  if (req.params.tree) {
    scopesArrayToTree(res, scopesStringsSet);
    return;
  }

  res.send(scopesArray);
}

/**
@function scopesArrayToTree

@description
The scopesArrayToTree method converts an array of scopes strings into a tree structure.

@param {res} res HTTP response.
@param {Set} scopesStringsSet Set of scopes strings.
*/
function scopesArrayToTree(res, scopesStringsSet) {
  const scopesTree = {};

  for (const scope of scopesStringsSet) {
    if (scope === '') continue;

    const rolesArr = scope.split('.');

    if (rolesArr.length > 1) {
      rolesArr.reduce(
        (accumulator, currentValue) => (accumulator[currentValue] ??= {}),
        scopesTree,
      );
    } else {
      scopesTree[scope] ??= {};
    }
  }

  res.send(scopesTree);
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
@function assignChecksum

@description
The method assigns a checksum to an object.

@param {object} obj Object for the checksum
*/
function assignChecksum(obj) {
  const objString = JSON.stringify(obj, null, 0);
  obj.checksum = createHash('sha256').update(objString).digest('hex');
}
