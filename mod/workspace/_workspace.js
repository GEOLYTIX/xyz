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

import getLocale from './getLocale.js';

import getLayer from './getLayer.js';

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
    return res.status(500).send('Failed to load workspace.');
  }

  // The keys object must own a user provided lookup key
  if (!Object.hasOwn(keyMethods, req.params.key)) {
    return res
      .status(400)
      .send(`Failed to evaluate '${req.params.key}' param.`);
  }

  return keyMethods[req.params.key](req, res);
}

/**
@function layer
@async

@description
The method requests a JSON layer from the getLayer module.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {string} [params.locale] Locale key.
@property {boolean} [params.layer] Layer key.
@property {Object} [params.user] User requesting the layer.

@returns {res} The HTTP response with either an error.message or the JSON layer.
*/
async function layer(req, res) {
  // Add default role * to all users.
  if (Array.isArray(req.params.user?.roles)) {
    req.params.user.roles.push('*');
  }

  const layer = await getLayer(req.params);

  if (layer instanceof Error) {
    return res.status(400).send(layer.message);
  }

  res.json(removeRoles(layer));
}

/**
@function locales
@async

@description
The locales method reduces the workspace.locales{} object to an array locales with only the key and name properties.

The locales are not merged with templates and only roles defined inside the workspace.locales{} locale object are considered for access.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {Object} [params.user] User requesting the locales.

@returns {res} The HTTP response with either an error.message or JSON array of locales in workspace.
*/
async function locales(req, res) {
  // Add default role * to all users.
  if (Array.isArray(req.params.user?.roles)) {
    req.params.user.roles.push('*');
  }

  if (req.params.locale) {
    getNestedLocales(req, res);
    return;
  }

  const locales = Object.values(workspace.locales)
    .filter((locale) => !!Roles.check(locale, req.params.user?.roles))
    .map((locale) => ({
      key: locale.key,
      name: locale.name,
      locales: locale.locales,
    }));

  res.send(locales);
}

async function getNestedLocales(req, res) {
  const locale = await getLocale(req.params);

  if (locale instanceof Error) {
    return res.status(400).send(locale.message);
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
      key,
      name: nestedLocale.name || key,
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
  // Add default role * to all users.
  if (Array.isArray(req.params.user?.roles)) {
    req.params.user.roles.push('*');
  }

  const locale = await getLocale(req.params);

  if (locale instanceof Error) {
    return res.status(400).send(locale.message);
  }

  // Return layer object instead of array of layer keys
  if (req.params.layers) {
    const layers = Object.keys(locale.layers).map(
      async (key) =>
        await getLayer({
          ...req.params,
          layer: key,
        }),
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

@description
The roles method returns an array of roles returned from the roles utility.

An object with detailed workspace.roles{} can be requested with the `detail=true` url parameter for the workspace/roles request.

@param {req} req HTTP request.
@param {req} res HTTP response.

@property {Object} req.params
HTTP request parameter.
@property {Boolean} params.detail
Whether the roles should be returned as an object with details.

@returns {Array|Object} Returns either an array of roles as string, or an object with roles as properties.
*/
function roles(req, res) {
  const rolesSet = new Set();

  (function objectEval(o, parent, key) {
    if (key === 'roles') {
      Object.keys(parent.roles).forEach((role) => {
        // Add role without negation ! to roles set.
        // The same role can not be added multiple times to the rolesSet.
        rolesSet.add(role.replace(/^!/, ''));
      });
    }

    // Iterate through the object tree.
    Object.keys(o).forEach((key) => {
      if (o[key] && typeof o[key] === 'object') {
        // Call method recursive for nested objects.
        objectEval(o[key], o, key);
      }
    });
  })(workspace);

  // Delete restricted Asterisk role.
  rolesSet.delete('*');

  const roles = Array.from(rolesSet);

  // If detail=true, return workspace.roles{} object (so you can specify information for each role).
  if (req.params.detail) {
    workspace.roles ??= {};

    // If the role is missing, add it to the workspace.roles{} object as an empty object.
    roles
      .filter((role) => !Object.hasOwn(workspace.roles, role))
      .forEach((role) => (workspace.roles[role] = {}));

    // Return the workspace.roles{} object.
    return res.send(workspace.roles);
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

@property {Object} req.params
HTTP request parameter.
@property {Object} params.user
The user requesting the test method.
@property {Boolean} user.admin
The user is required to have admin priviliges.
*/
async function test(req, res) {
  if (!req.params.user?.admin) {
    res
      .status(403)
      .send(`Admin credentials are required to test the workspace sources.`);
    return;
  }

  // Force re-caching of workspace.
  workspace = await workspaceCache(true);

  const test = {
    results: {},
    errArr: [],
    used_templates: [],
    properties: new Set(['template', 'templates', 'query']),
  };

  test.workspace_templates = new Set(
    Object.entries(workspace.templates)
      .filter(([key, value]) => value._type === 'workspace')
      .map(([key, value]) => key),
  );

  // Create clone of workspace_templates
  test.unused_templates = new Set([...test.workspace_templates]);

  test.overwritten_templates = new Set();

  for (const localeKey of Object.keys(workspace.locales)) {
    // Will get layer and assignTemplates to workspace.
    const locale = await getLocale({
      locale: localeKey,
      user: req.params.user,
    });

    // If you can't get the locale, access is denied, add the error to the errArr.
    if (locale.message === 'Role access denied') {
      test.errArr.push(`${localeKey}: ${locale.message}`);
      continue;
    }

    // If the locale has no layers, just skip it.
    if (!locale.layers) continue;

    for (const layerKey of Object.keys(locale.layers)) {
      // Will get layer and assignTemplates to workspace.
      const layer = await getLayer({
        locale: localeKey,
        layer: layerKey,
        user: req.params.user,
      });

      locale.layers[layerKey] = layer;

      if (layer.err) test.errArr.push(`${layerKey}: ${layer.err}`);
    }

    // Test locale and all of its layers as nested object.
    templateUse(locale, test);
  }

  // From here on its 🐢 Templates all the way down.
  for (const key of Object.keys(workspace.templates)) {
    const template = await getTemplate(key);

    if (template.err) test.errArr.push(`${key}: ${template.err.path}`);
  }

  test.results.errors = test.errArr.flat();

  test.results.unused_templates = Array.from(test.unused_templates);

  test.results.overwritten_templates = Array.from(test.overwritten_templates);

  // Sort the array.
  test.used_templates.sort((a, b) => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  // Reduce the test.used_templates array to count the occurance of each template.
  test.results.usage = Object.fromEntries(
    test.used_templates.reduce(
      (acc, e) => acc.set(e, (acc.get(e) || 0) + 1),
      new Map(),
    ),
  );

  res.setHeader('content-type', 'application/json');

  res.send(JSON.stringify(test.results));
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
