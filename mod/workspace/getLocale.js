/**
## /workspace/getLocale
The getLocale module exports the getLocale method which is required by the getLayer and workspace modules.

@requires /utils/roles
@requires /workspace/mergeTemplates
@requires /workspace/cache
@requires /workspace/getTemplate

@module /workspace/getLocale
*/

import * as Roles from '../utils/roles.js';

import mergeTemplates from './mergeTemplates.js';

import workspaceCache from './cache.js';

/**
@function getLocale
@async

@description
The getLocale method requests the workspace from cache and checks whether the requested locale is a property of the workspace.locales{}.

The workspace.locale is assigned as locale if params.locale is undefined.

The mergeTemplate module will be called to merge templates into the locale object and substitute SRC_* xyzEnvironment variables.

A role check is performed to check whether the requesting user has access to the locale.

Role objects in the locale and nested layers are merged with their respective parent objects.

@param {Object} params 
@property {string} [params.locale] Locale key.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.

@returns {Promise<Object|Error>} JSON Locale.
*/
export default async function getLocale(params) {
  const workspace = await workspaceCache();

  if (workspace instanceof Error) {
    return workspace;
  }

  const localeKey = Array.isArray(params.locale) ? params.locale.shift(): params.locale;

  if (localeKey && !Object.hasOwn(workspace.locales, localeKey)) {
    return new Error('Unable to validate locale param.');
  }

  // The workspace.locale is assigned as locale if workspace.locales does not hold the localeKey
  let locale = Object.hasOwn(workspace.locales, localeKey)
    ? workspace.locales[localeKey]
    : workspace.locale;

  locale = await mergeTemplates(locale);

  if (!Roles.check(locale, params.user?.roles)) {
    return new Error('Role access denied.');
  }

  locale = Roles.objMerge(locale, params.user?.roles);

  locale.workspace = workspace.key;
  locale.layers ??= {};

  return locale;
}
