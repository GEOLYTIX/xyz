/**
## /workspace/getLocale
The getLocale module exports the getLocale method which is required by the getLayer and workspace modules.

@requires /utils/roles
@requires /utils/merge
@requires /workspace/mergeTemplates
@requires /workspace/cache
@requires /workspace/getTemplate

@module /workspace/getLocale
*/

import merge from '../utils/merge.js';
import * as Roles from '../utils/roles.js';
import workspaceCache from './cache.js';

import getTemplate from './getTemplate.js';
import mergeTemplates from './mergeTemplates.js';

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

  if (!params.user?.admin) {
    delete params.ignoreRoles;
  }

  if (typeof params.locale === 'string') {
    params.locale = params.locale.split(',');
  }

  const localeKey = Array.isArray(params.locale)
    ? params.locale.shift()
    : params.locale;

  let locale;

  if (!localeKey || localeKey === 'locale') {
    locale = workspace.locale;
  } else if (Object.hasOwn(workspace.locales, localeKey)) {
    locale = workspace.locales[localeKey];
  } else {
    locale = await getTemplate(localeKey);
  }

  if (locale instanceof Error) {
    return new Error(locale.message);
  }

  // The roles property maybe assigned from a template. Templates must be merged prior to the role check.
  locale = await mergeTemplates(locale, params.user?.roles);

  //If the user is an admin we don't need to check roles
  if (
    locale instanceof Error ||
    (!params.ignoreRoles && !Roles.check(locale, params.user?.roles))
  ) {
    return new Error('Role access denied.');
  }

  locale = Roles.objMerge(locale, params.user?.roles);

  locale.workspace = workspace.key;

  locale.name ??= locale.key;

  if (parentLocale) {
    // Only locales of a nested locales should be used for further nesting.
    delete parentLocale.locales;

    parentLocale.keys ??= [parentLocale.key];
    parentLocale.name ??= parentLocale.key;
    locale.keys = [locale.key];

    // Compose the nested locale name.
    locale.name = `${parentLocale.name}/${locale.name}`;

    locale = merge(parentLocale, locale);
  }

  if (Array.isArray(params.locale) && params.locale.length > 0) {
    locale = await getLocale(params, locale);
  }

  if (Array.isArray(locale.keys)) {
    locale.key = locale.keys;
  }

  // Remove properties which are only required for the fetching templates and composing workspace objects.
  delete locale.src;
  delete locale.template;
  delete locale.templates;
  delete locale._type;

  return locale;
}
