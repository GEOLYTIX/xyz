/**
## /workspace/getLocale
The getLocale module exports the getLocale method which is required by the getLayer and workspace modules.

@requires /utils/envReplace
@requires /utils/merge
@requires /utils/roles
@requires /workspace/cache
@requires /workspace/composeObj
@requires /workspace/getTemplate

@module /workspace/getLocale
*/

import envReplace from '../utils/envReplace.js';
import merge from '../utils/merge.js';
import * as Roles from '../utils/roles.js';
import workspaceCache from './cache.js';
import composeObj from './composeObj.js';
import getTemplate from './getTemplate.js';

/**
@function getLocale
@async

@description
The getLocale method requests the workspace from cache and checks whether the requested locale is a property of the workspace.locales{}.

The workspace.locale is assigned as locale if params.locale is undefined.

Any locale can be nested into another locale, if the locale property is defined as an array of locale keys.

The localeKey will be shifted from the locale array property. The getLocale method will call itself recursively with the locale object provided as parentLocale param. The current locale object will be merged into the parentLocale. The locale key for nested locales is an array which reflects the locale array property.

The locales array property which provides an interface for locales which can be nested but are not available from the workspace.locales directly is removed on nested locales.

The mergeTemplate module will be called to merge templates into the locale object and substitute SRC_* xyzEnvironment variables.

A role check is performed to check whether the requesting user has access to the locale.

Role objects in the locale and nested layers are merged with their respective parent objects.

Template properties will be removed as these are not required by the MAPP API but only for the composition of workspace objects.

@param {Object} params
@param {Object} [parentLocale] Locale will be merged into optional parentLocale to create a nested locale.
@property {string} [params.locale] Locale key.
@property {array} [params.locale] An array of locale keys to be merged as a nested locale.
@property {Object} [params.user] Requesting user.
@property {Boolean} [params.ignoreRoles] Whether role check should be performed.
@property {Array} [user.roles] User roles.

@returns {Promise<Object|Error>} JSON Locale.
*/
export default async function getLocale(params, parentLocale) {
  const workspace = await workspaceCache();

  if (workspace instanceof Error) {
    return workspace;
  }

  if (params.ignoreRoles) {
    params.user.roles = true;
  }

  if (typeof params.locale === 'string') {
    params.locale = params.locale.split(',');
  }

  const localeKey = Array.isArray(params.locale)
    ? params.locale.shift()
    : params.locale;

  let locale;

  if (!localeKey || localeKey === 'locale') {
    // The workspace.locale must not be modified.
    locale = structuredClone(workspace.locale);
  } else if (Object.hasOwn(workspace.locales, localeKey)) {
    // Workspace locales must not be modified.
    locale = structuredClone(workspace.locales[localeKey]);
  } else {
    // getTemplate returns a structuredClone.
    locale = await getTemplate(localeKey);
  }

  // TODO: why is a new Error created from an Error?
  if (locale instanceof Error) {
    return new Error(locale.message);
  }

  // TODO disabled until template composition is fixed to not modify the workspace templates.
  //locale = await processRoles(locale, parentLocale, params);

  if (locale instanceof Error) {
    return locale;
  }

  locale = await composeLocale(locale, parentLocale, params, workspace.key);

  return locale;
}

/**
@function processRoles
@async

@description
The processRoles method calls the utility method that combines a parentLocale roles with a locale.

The locale.template and templates[] will be merged into the locale object.

Locale access for the user will be checked without the ignoreRoles property provided in the params object.

An error will be returned if the user does not have access to the role.

If the parentLocale has a localesRoleContext property (set by mergeTemplates when a template contributes a locales array), it is used as the role context for combining. This ensures nested locales are combined only with the roles of the template that defined the locales array, not the accumulated roles of all sibling templates.

@param {Object} locale
@param {Object} parentLocale Parent locale with roles.
@param {Object} params
@property {user} [params.user] User object with access roles.
@property {boolean} [params.ignoreRoles] Ignore roles for template merging and checks.

@returns {Promise<Object|Error>} JSON Locale.
*/
async function processRoles(locale, parentLocale, params) {
  // Assign parent roles to locale for combination.
  // Use the scoped localesRoleContext if available, so that nested locales are combined only with the template's roles that contributed the locales array, not accumulated sibling template roles.
  if (parentLocale?.roles) {
    const roleContext = parentLocale.localesRoleContext || parentLocale;
    Roles.combine(locale, roleContext);
  }

  // Pass params.user.roles to enforce role checks on merged templates.
  // TODO: ensure that the roles are checked in the composeObj
  locale = await composeObj(locale, params.user?.roles);

  // The composeObj method returned an Error.
  if (locale instanceof Error) {
    return locale;
  }

  // Strict Role Check
  if (params.ignoreRoles) {
    return locale;
  }

  if (!Roles.check(locale.roles, params.user?.roles)) {
    return new Error('Role access denied.');
  }

  return locale;
}

/**
@function composeLocale
@async

@description
Composes the final locale object by merging with an optional parentLocale and recursively processing further nested locales.

When a parentLocale is provided, its properties are merged into the locale. The locale name and role are composed with dot-notation to reflect the nesting hierarchy.

Temporary properties used during workspace composition (src, template, templates, _type, localesRoleContext) are removed before returning.

@param {Object} locale The locale object to compose.
@param {Object} [parentLocale] Optional parent locale to merge into.
@param {Object} params Request parameters including locale keys and user.
@param {string} workspaceKey The workspace key to assign.

@returns {Promise<Object>} The composed locale object.
*/
async function composeLocale(locale, parentLocale, params, workspaceKey) {
  locale.workspace = workspaceKey;

  locale.name ??= locale.key;

  if (parentLocale) {
    // Only locales of a nested locales should be used for further nesting.
    delete parentLocale.locales;

    parentLocale.keys ??= [parentLocale.key];
    parentLocale.name ??= parentLocale.key;
    locale.keys = [locale.key];

    // Compose the nested locale name.
    locale.name = `${parentLocale.name}/${locale.name}`;

    if (parentLocale.role && locale.role) {
      // When localesRoleContext exists, compose the role with the most specific parent path from the context (e.g., "uk.stores") rather than the locale's own role (e.g., "uk"), which would create a spurious compound like "uk.brand_a" instead of "uk.stores.brand_a".
      if (parentLocale.localesRoleContext?.roles) {
        const contextRoles = Object.keys(parentLocale.localesRoleContext.roles);
        // Use the longest role as it represents the most specific path.
        const parentRole = contextRoles.toSorted(
          (a, b) => b.length - a.length,
        )[0];
        locale.role = `${parentRole}.${locale.role}`;
      } else {
        locale.role = `${parentLocale.role}.${locale.role}`;
      }
    }

    locale = merge(structuredClone(parentLocale), locale);
  }

  if (Array.isArray(params.locale) && params.locale.length > 0) {
    // TODO: What happens if getLocale returns an error?
    locale = await getLocale(params, locale);
  }

  if (Array.isArray(locale.keys)) {
    locale.key = locale.keys;
  }

  if (Array.isArray(locale.plugins)) {
    locale.plugins = locale.plugins.map((plugin) => envReplace(plugin));
  }

  return locale;
}
