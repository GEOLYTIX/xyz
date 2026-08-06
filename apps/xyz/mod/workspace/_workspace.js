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

// It should not be possible to modify object prototypes.
// Keep this hardening enabled outside Vitest environments.
if (!process.env.VITEST) Object.freeze(Object.prototype);

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
  roles, // deprecated, use scopes instead
  test,
  compose,
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
  Object.assign(req.params, req._params);

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

  delete locale.role;
  delete locale.parentRoles;

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
      key: nestedLocale.keys.join(','),
      name: nestedLocale.name,
      locales: nestedLocale.locales,
    });
  }

  res.send(nestedLocales);
}

/**
@function roles

@description
The roles method is deprecated. Use the scopes method instead.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
function roles(req, res) {
  res
    .status(410) // Gone
    .send(
      `The workspace/roles endpoint is deprecated. Use workspace/scopes instead.`,
    );
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

  // TODO check why the scopes array is different from composedWorkspace
  // const cachedWorkspace = await composeWorkspace();

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
    await nestedLocales({ locales: {} }, locale, { roles: true });
  }

  const scopesArray = Array.from(cachedWorkspace.scopes)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  if (req.params.tree) {
    scopesArrayToTree(res, cachedWorkspace.scopes);
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
async function nestedLocales(cachedWorkspace, locale, user) {
  if (!Array.isArray(locale.locales)) return;

  const keys = locale.keys ?? [locale.key];
  for (const localeKey of locale.locales) {
    const nestedLocale = await getLocale({
      locale: [...keys, localeKey],
      layers: true,
      user,
    });

    cachedWorkspace.locales[nestedLocale.key] = nestedLocale;

    await nestedLocales(cachedWorkspace, nestedLocale, user);
  }
}

/**
@function test

@description
The test method is an admin-only endpoint that checks the workspace sources for errors and warnings.

@param {req} req HTTP request.
@param {req} res HTTP response.

@property {Object} req.params HTTP request params.
@property {Object} params.user User requesting the test method.
@property {boolean} params.user.admin Whether user has admin privileges (required).
*/
async function test(req, res) {
  if (!req.params.user?.admin) {
    res
      .status(403)
      .send(`Admin credentials are required to test the workspace sources.`);
    return;
  }

  const cachedWorkspace = await composeWorkspace();

  const warnings = new Set();

  parseWarnings(warnings, cachedWorkspace.locale);

  parseWarnings(warnings, cachedWorkspace.locales);

  const templateWarn = Array.from(warnings).sort((a, b) => a.localeCompare(b));

  const negatedRoles = new Set();

  cachedWorkspace.scopes.forEach((scope) => {
    scope.split('.').forEach((role) => {
      if (role.startsWith('!')) {
        negatedRoles.add(role);
      }
    });
  });

  const testResult = {
    srcErr: cachedWorkspace.err?.sort((a, b) => a.localeCompare(b)) ?? [],
    templateWarn,
    negatedRoles: Array.from(negatedRoles).sort((a, b) => a.localeCompare(b)),
  };

  res.setHeader('content-type', 'application/json');

  res.send(testResult);
}

/**
@function parseWarnings

@description
The parseWarnings method recursively iterates an object and collects any warn[] arrays into a single warnings array.

@param {Array} warnings The array to collect warnings.
@param {Object} obj The object to iterate for warn[] arrays.
*/
function parseWarnings(warnings, obj) {
  if (typeof obj !== 'object') return;

  if (obj === null) return;

  for (const [key, val] of Object.entries(obj)) {
    if (key === 'warn' && Array.isArray(val)) {
      val.forEach((warning) => warnings.add(warning));
      continue;
    }

    if (Array.isArray(val)) {
      val.forEach((item) => parseWarnings(warnings, item));
      continue;
    }

    if (typeof val === 'object') {
      parseWarnings(warnings, val);
      continue;
    }
  }
}

/**
@function compose

@description
The compose method returns a fully composed workspace object with all templates, locales, and layers resolved.

@param {req} req HTTP request.
@param {res} res HTTP response.

@property {Object} req.params HTTP request params.
@property {Object} params.user User requesting the compose method.
@property {boolean} params.user.admin Whether user has admin privileges (required).
*/
async function compose(req, res) {
  if (!req.params.user?.admin) {
    res
      .status(403)
      .send(`Admin credentials are required to compose the workspace.`);
    return;
  }

  const composedWorkspace = await composeWorkspace();

  delete composedWorkspace.templates;
  delete composedWorkspace.scopes;

  assignChecksum(composedWorkspace);

  res.setHeader('content-type', 'application/json');

  res.send(composedWorkspace);
}

/**
@function composeWorkspace
@async

@description
The composeWorkspace method returns a fully composed workspace object with all templates, locales, and layers resolved.

The workspaceCache() is called to retrieve the cached workspace. The cacheSources() method is called to ensure that all sources are cached and any errors are logged.

The nestedLocales() method is called for each locale in the cached workspace to ensure that all nested locales are loaded and checked for user access.

@returns {Promise<Object>} The fully composed workspace object.
*/
async function composeWorkspace() {
  const cachedWorkspace = await workspaceCache(true);

  cachedWorkspace.err = await cacheSources(cachedWorkspace);

  // The nestedLocales method will be called for each locale in the cached workspace to ensure that all nested locales are loaded and checked for user access.
  for (const localeKey of Object.keys(cachedWorkspace.locales)) {
    const locale = await getLocale({
      locale: localeKey,
      layers: true,
      user: { roles: true },
    });

    cachedWorkspace.locales[localeKey] = locale;
    await nestedLocales(cachedWorkspace, locale, { roles: true });
  }
  return cachedWorkspace;
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
