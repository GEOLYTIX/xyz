/**
## /workspace/scopes

The scopes module exports the getScopes method which returns the complete set of templateScopes defined in the workspace.

A templateScope is only recorded in workspace.scopes{} when the object which defines it is composed. The getScopes method therefore composes every locale, nested locale, and layer with role checks bypassed before the scopes are read.

@requires /provider/getSrc
@requires /workspace/cache
@requires /workspace/getLocale

@module /workspace/scopes
*/

import { cacheSources } from '../provider/getSrc.js';
import workspaceCache from './cache.js';
import getLocale from './getLocale.js';

/**
@function getScopes
@async

@description
The workspace cache is rebuilt and all sources are cached before every locale is composed. Composition is required to populate the workspace.scopes{} set.

Locales are composed with the roles parameter set to true so that every templateScope is recorded regardless of role access. The composed locales are discarded; only the scopes recorded during composition are returned.

@returns {Promise<Set<string>>} The set of templateScopes defined in the workspace.
*/
export async function getScopes() {
  const workspace = await workspaceCache(true);

  const errors = await cacheSources(workspace);

  if (errors.length) {
    console.error(new Error(errors.join('\n')));
  }

  for (const localeKey of Object.keys(workspace.locales)) {
    const locale = await getLocale({
      locale: localeKey,
      layers: true,
      user: { roles: true },
    });

    await composeNestedLocales(locale);
  }

  return workspace.scopes;
}

/**
@function composeNestedLocales
@async

@description
The method iterates the locale.locales array property and composes each nested locale so that the templateScopes of nested locales are recorded.

The method is called recursively to compose further nested locales.

@param {Object} locale The composed locale.
@property {Array} [locale.locales] An array of nested locale keys.
@property {Array} [locale.keys] The locale key chain of a nested locale.
*/
async function composeNestedLocales(locale) {
  if (!Array.isArray(locale?.locales)) return;

  const keys = locale.keys ?? [locale.key];

  for (const localeKey of locale.locales) {
    const nestedLocale = await getLocale({
      locale: [...keys, localeKey],
      layers: true,
      user: { roles: true },
    });

    await composeNestedLocales(nestedLocale);
  }
}

/**
@function scopesArray

@description
The method returns a sorted array of scope strings with empty scopes removed.

@param {Set<string>} scopes Set of scope strings.
@returns {Array<string>} Sorted array of scope strings.
*/
export function scopesArray(scopes) {
  return Array.from(scopes)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

/**
@function scopesTree

@description
The method converts a set of dot delimited scope strings into a nested tree structure.

@param {Set<string>} scopes Set of scope strings.
@returns {Object} The scopes tree.
*/
export function scopesTree(scopes) {
  const tree = {};

  for (const scope of scopes) {
    if (scope === '') continue;

    let node = tree;

    for (const part of scope.split('.')) {
      node = node[part] ??= {};
    }
  }

  return tree;
}

/**
@function checkScope

@description
The checkScope method checks whether the user has access to the object based on the provided roles and templateScope.

The method is exported so that hosts which resolve roles outside the workspace API can evaluate scope strings with the same semantics applied during composition.

If the roles parameter is falsy, the method will return false.

If the roles parameter is true, the method will return true.

If the roles parameter is an array, the method will check whether the templateScope string is included in the roles array. If so, it will return true.

@param {array} templateScope
@param {array} roles
@returns {boolean} Returns true if the user has access based on the roles and templateScope.
*/
export function checkScope(templateScope, roles) {
  // The templateScope array is empty, meaning there are no access restrictions.
  if (!templateScope.length) return true;

  // Prevent access if no roles are provided from user.
  if (!roles) return false;

  // Admin endpoints will set the roles parameter to true to bypass role checks.
  if (roles === true) return true;

  // Filter out undefined values from the templateScope array and join the remaining values with a pipe character to create a string representation of the template scope.
  const templateScopeString = templateScope.join('.');

  // Check whether the roles array includes the templateScopeString.
  if (roles.includes(templateScopeString)) {
    return true;
  }

  // Access should be granted if the templateScopeString is the first part of any nested role.
  if (roles.some((role) => role.startsWith(`${templateScopeString}.`))) {
    return true;
  }

  if (templateScopeString === '*') return true;

  // Validate access if roles array contains every scope in the templateScope array. Must be enabled in xyzEnv.LEGACY_ROLES to allow for legacy role checks. This is a temporary solution to allow for legacy role checks until the roles are refactored to be more granular and hierarchical.
  if (
    xyzEnv.LEGACY_ROLES &&
    templateScope.every((scope) => roles.includes(scope))
  ) {
    return true;
  }

  return false;
}
