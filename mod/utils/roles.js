/**
 * Roles utility module for handling role-based access control and object merging
 * @module /utils/roles
 */

/**
 * @global
 * @typedef {Object} roles
 * @property {Object} roles - roles configuration object
 * @property {boolean} [roles.*] - Wildcard role indicating unrestricted access
 * @property {Object} [roles.key] - Role-specific properties to merge
 * @property {Object} [roles.'!key'] - Negated role properties (applied when user doesn't have the role)
 */

const merge = require('./merge')

module.exports = {
  check,
  objMerge
}

/**
 * Checks if an object should be accessible based on user roles
 * @param {Object} obj - The object to check access for
 * @param {roles} obj.roles - Role configuration object
 * @param {Array<string>} user_roles - Array of roles assigned to the user
 * @returns {(Object|boolean)} Returns the original object if access is granted, false otherwise
 * 
 * @example
 * // Object with unrestricted access
 * check({ roles: { '*': true }, data: 'content' }, ['user']) // returns object
 * 
 * // Object with role restriction
 * check({ roles: { admin: true }, data: 'content' }, ['user']) // returns false
 * check({ roles: { admin: true }, data: 'content' }, ['admin']) // returns object
 * 
 * // Object with negated roles
 * check({ roles: { '!guest': true }, data: 'content' }, ['guest']) // returns false
 * check({ roles: { '!guest': true }, data: 'content' }, ['user']) // returns object
 */
function check(obj, user_roles) {

  // The object to check has no roles assigned.
  if (!obj.roles) return obj;

  // Always return object with '*' asterisk role.
  if (Object.hasOwn(obj.roles, '*')) return obj;

  if (!user_roles) return false

  // Some negated role is included in user_roles[]
  const someNegatedRole = Object.keys(obj.roles).some(
    (role) => /^!/.exec(role) && user_roles.includes(role.replace(/^!/, ''))
  );

  if (someNegatedRole) return false;

  // Check whether every role is negated.
  const everyNegatedRoles = Object.keys(obj.roles).every((role) =>
    /^!/.exec(role)
  );

  if (everyNegatedRoles) return obj;

  // Some positive role is included in user_roles[]
  const somePositiveRole = Object.keys(obj.roles).some((role) =>
    user_roles.includes(role)
  );

  if (somePositiveRole) return obj;

  // The check fails by default.
  return false;
}

/**
 * Recursively merges role-specific object properties based on user roles
 * @param {Object} obj - The object to process
 * @param {roles} obj.roles - Role configuration object
 * @param {Array<string>} user_roles - Array of roles assigned to the user
 * @returns {Object} Processed object with merged role-specific properties
 * 
 * @example
 * const obj = {
 *   name: 'layer',
 *   roles: {
 *     admin: { secretField: 'sensitive' },
 *     user: { publicField: 'visible' }
 *   }
 * };
 * 
 * // With admin role
 * objMerge(obj, ['admin']); 
 * // Returns: { name: 'layer', secretField: 'sensitive', roles: {...} }
 * 
 * // With user role
 * objMerge(obj, ['user']);
 * // Returns: { name: 'layer', publicField: 'visible', roles: {...} }
 * 
 * @description
 * The function handles several special cases:
 * - Recursively processes nested objects
 * - Handles arrays by mapping over their elements
 * - Processes negated roles (prefixed with '!')
 * - Preserves the original object if conditions aren't met
 * - Skip null or undefined values
 */
function objMerge(obj, user_roles) {

  if (typeof obj !== 'object') return obj;

  if (!user_roles) return obj

  if (Array.isArray(obj)) {

    return obj.map(arrEntry => objMerge(arrEntry, user_roles))
  }

  Object.keys(obj)
    .filter(key => typeof obj[key] === 'object')
    .forEach(key => {

      // Cannot convert undefined or null to object.
      if (!obj[key]) return;

      obj[key] = objMerge(obj[key], user_roles)
    })

  if (!obj.roles) return obj;

  if (typeof obj.roles !== 'object') return obj;

  if (Array.isArray(obj.roles)) return obj;

  if (typeof obj.roles === 'function') return obj;

  const clone = structuredClone(obj)

  function notIncludesNegatedRole(role, user_roles) {

    return role.match(/(?<=^!)(.*)/g)?.[0] ?
      !user_roles.includes(role.match(/(?<=^!)(.*)/g)?.[0]) :
      false
  }

  Object.keys(clone.roles)
    .filter(role => clone.roles[role] !== true)
    .filter(role => clone.roles[role] !== null)
    .filter(role => typeof clone.roles[role] === 'object')
    .filter(role => !Array.isArray(clone.roles[role]))
    .filter(role => user_roles.includes(role) || notIncludesNegatedRole(role, user_roles))
    .forEach(role => {
      merge(clone, clone.roles[role])
    })

  return clone
}