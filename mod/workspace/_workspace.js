/**
## /workspace
The Workspace API module exports the getKeyMethod() which returns a method from the keyMethods{} object.

- layer
- locale
- locales
- roles

The workspace typedef object has templates, locale, locales, dbs, and roles properties. The workspace will be cached in the process by the workspace/cache module.

@requires /workspace/cache
@requires /workspace/getLocale
@requires /workspace/getLayer
@requires /workspace/getTemplate
@requires /utils/roles

@module /workspace
*/

/**
@global
@typedef {Object} workspace
The workspace object defines the mapp resources available in an XYZ instance.
@property {Object} [roles] Each property of the roles object is a role which can be assigned to a user.
@property {string} [dbs] The fallback dbs connection if not implicit in [query] template.
@property {Object} locale The default locale which serves as a templates for all locales in workspace.
@property {Object} locales Each property in the locales object is a locale available from this workspace.
*/

import * as Roles from '../utils/roles.js';
import workspaceCache from './cache.js';
import getLayer from './getLayer.js';
import getLocale from './getLocale.js';
import getTemplate from './getTemplate.js';

const keyMethods = {
  layer,
  locale,
  locales,
  roles,
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

  res.json(removeRoles(layer));
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

@returns {res} The HTTP response with a JSON array of accessible locale objects.
*/
async function locales(req, res) {
  if (req.params.locale) {
    getNestedLocales(req, res);
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

@returns {res} The HTTP response with either an error.message or JSON array of
locales in workspace.
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
    const nestedLocale = await getTemplate(key);

    if (!Roles.check(nestedLocale, req.params.user?.roles)) continue;

    nestedLocales.push({
      key: `[${locale.key},${key}]`,
      name: `${locale.name}/${nestedLocale.name || key}`,
      locales: nestedLocale.locales,
    });
  }

  res.send(nestedLocales);
}

/**
@function locale
@async

@description
The method requests a JSON locale from the getLocale module.

All locale layers are requested from the getLayer module with `params.layers` flag.

The locale.layers{} object is reduced to an array of layer keys without the `params.layers` flag.

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
    return res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(locale.message);
  }

  if (Array.isArray(locale.keys)) {
    req.params.locale = locale.keys;
  }

  // Prevent with no [] layers to crash the iteration process.
  locale.layers ??= {};

  // Return layer object instead of array of layer keys
  if (req.params.layers) {
    const layers = Object.keys(locale.layers).map(
      async (key) =>
        await getLayer(
          {
            ...req.params,
            layer: key,
          },
          locale,
        ),
    );

    await Promise.all(layers).then((layers) => {
      locale.layers = layers
        .filter((layer) => !!layer)

        // The getLayer method will return an Error if role access is prevented.
        .filter((layer) => !(layer instanceof Error));
    });

    const localeWithoutRoles = removeRoles(locale);

    return res.json(localeWithoutRoles);
  }

  // Check layer access.
  locale.layers =
    locale.layers &&
    Object.entries(locale.layers)

      // filter layers which are null
      .filter((layer) => layer[1] !== null)

      // check layer for user roles
      .filter((layer) => !!Roles.check(layer[1], req.params.user?.roles))
      .map((layer) => layer[0]);

  res.json(removeRoles(locale));
}

/**
@function roles
@async

@description
The roles method returns an array of roles returned from the roles utility.

This method is only available to users with admin credentials.

The cacheTemplates method will called to read any template from it's src and cache the template. This is required to extract any roles from the workspace which may be defined in a template only.

The workspace.roles{} object will be returned with the `detail=true` url parameter.

A hierarchical tree structure can be requested with the `tree=true` url parameter.

@param {req} req HTTP request.
@param {res} res HTTP response.

@property {Object} req.params HTTP request parameter.
@property {Object} params.user User requesting the roles.
@property {boolean} params.user.admin Whether user has admin privileges (required).
@property {boolean} [params.tree] Whether the roles should be returned as a hierarchical tree structure.

@returns {Array|Object} Returns either an array of roles as strings, detailed roles object, or hierarchical roles tree.
*/
async function roles(req, res) {
  if (!req.params.user?.admin) {
    res
      .status(403)
      .send(`Admin credentials are required to test the workspace sources.`);
    return;
  }

  if (req.params.detail) {
    return res.send(workspace.roles);
  }

  await cacheTemplates({
    user: req.params.user,
  });

  const rolesSet = new Set();

  Roles.fromObj(rolesSet, workspace);

  const rolesTree = {};

  // Delete restricted Asterisk role.
  rolesSet.delete('*');

  rolesSet.forEach((role) => {
    const roles = role.split('.');

    if (roles.length > 1) {
      roles.reduce(
        (accumulator, currentValue) => (accumulator[currentValue] ??= {}),
        rolesTree,
      );

      // Pop last role from array into roleSet.
      rolesSet.add(roles.pop());
    } else {
      rolesTree[role] ??= {};
    }
  });

  const roles = Array.from(rolesSet);

  if (req.params.tree) {
    return res.send(rolesTree);
  }

  res.send(roles);
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

  // Force re-caching of workspace.
  if (req.params.force) {
    await cacheTemplates({
      user: req.params.user,
      force: req.params.force,
    });
  }

  const testConfig = {
    errArr: [],
    properties: new Set(['template', 'templates', 'query']),
    results: {},
    used_templates: [],
    unused_templates: [],
  };

  testConfig.workspace_templates = new Set(
    Object.entries(workspace.templates)
      .filter(([key, value]) => value._type === 'workspace')
      .filter(([key, value]) => !value.src?.endsWith('.html'))
      .map(([key, value]) => key),
  );

  // Create clone of workspace_templates
  testConfig.unused_templates = new Set([...testConfig.workspace_templates]);
  testConfig.overwritten_templates = new Set();

  testWorkspaceLocales(testConfig);

  for (const [key, template] of Object.entries(workspace.templates)) {
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
@function removeRoles
@description
Recursively removes all 'roles' objects from the provided object [locale, layer].
This function is designed to sanitize locale configuration objects before sending to the client,
ensuring that role-based permissions data is not exposed.
@param {object} obj A locale or layer JSON object.
@returns {object}
*/
function removeRoles(obj) {
  // If param is not an object or is null, return as is
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // If object is an array, process each element
  if (Array.isArray(obj)) {
    return obj.map((item) => removeRoles(item));
  }

  // Create a new object to store cleaned properties
  const cleanedObj = {};

  // Process each property in the object
  for (const [key, value] of Object.entries(obj)) {
    // Skip 'roles' properties
    if (key === 'roles') {
      continue;
    }

    // Recursively clean nested objects
    cleanedObj[key] = removeRoles(value);
  }

  return cleanedObj;
}

/**
@function cacheTemplates
@async

@description
Gets and caches a complete workspace with all locales, layers, and templates pre-loaded.

The workspaceCache method will be forced to clear the cached workspace and load the workspace again which may have changed. This is required for testing purposes. If templates should be loaded in order to extract roles it may be beneficial to use already cached templates.

The method will iterate over the workspace.locales to cache any templates defined in the locales object.

A getLayer promise for each layer in a locale will be added to a promises array. All getLayer promises must be settled before the next locale can be processed.

Finally each template defined in the workspace.templates will be cached.

@param {user} params Configuration parameter for workspace caching.
@property {Object} [params.user] User context for permission checking when loading locales and layers.
@property {Boolean} [params.force] Whether the cached workspace should be cleared.
*/
async function cacheTemplates(params) {
  workspace = await workspaceCache(params.force);

  for (const localeKey of Object.keys(workspace.locales)) {
    // Will get layer and assignTemplates to workspace.
    const locale = await getLocale({
      locale: localeKey,
      user: params.user,
      ignoreRoles: true,
    });

    // If the locale has no layers, just skip it.
    if (!locale.layers) continue;

    const layerPromises = Object.keys(locale.layers).map(async (layerKey) => {
      // Will get layer and assignTemplates to workspace.
      const layer = await getLayer({
        layer: layerKey,
        locale: localeKey,
        user: params.user,
        ignoreRoles: true,
      });

      locale.layers[layerKey] = layer;
    });

    await Promise.allSettled(layerPromises);
  }

  // hydrating/caching all the templates
  for (const key of Object.keys(workspace.templates)) {
    await getTemplate(key);
  }
}
