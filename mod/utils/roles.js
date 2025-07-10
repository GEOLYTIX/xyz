/**
## /utils/roles
Roles utility module for handling role-based access control and object merging

@requires /utils/merge
@module /utils/roles
*/

/**
@global
@typedef {Object} roles
@property {Object} roles - roles configuration object
@property {boolean} [roles.*] - Wildcard role indicating unrestricted access
@property {Object} [roles.key] - Role-specific properties to merge
@property {Object} [roles.'!key'] - Negated role properties (applied when user doesn't have the role)
*/

import merge from './merge.js';

/**
@function check
@description
Checks if an object should be accessible based on user roles

```js
// Object with unrestricted access
check({ roles: { '*': true }, data: 'content' }, ['user']) // returns object

// Object with role restriction
check({ roles: { admin: true }, data: 'content' }, ['user']) // returns false
check({ roles: { admin: true }, data: 'content' }, ['admin']) // returns object

// Object with negated roles
check({ roles: { '!guest': true }, data: 'content' }, ['guest']) // returns false
check({ roles: { '!guest': true }, data: 'content' }, ['user']) // returns object
```

@param {Object} obj The object to check access for
@param {Array<string>} user_roles Array of roles assigned to the user
@property {roles} obj.roles Role configuration object
@returns {(Object|boolean)} Returns the original object if access is granted, false otherwise
*/
export function check(obj, user_roles) {
  // The object to check has no roles assigned.
  if (!obj.roles) return obj;

  // Always return object with '*' asterisk role.
  if (Object.hasOwn(obj.roles, '*')) return obj;

  if (!user_roles) return false;

  // Add last of dot notation role to rolesArr
  const rolesArr = Object.keys(obj.roles);

  // Pop last role from dot notation roles into rolesArr for backwards compatibility.
  Object.keys(obj.roles).forEach((role) =>
    rolesArr.push(role.split('.').pop()),
  );

  // Some negated role is included in user_roles[]
  const someNegatedRole = rolesArr.some(
    (role) => /^!/.exec(role) && user_roles.includes(role.replace(/^!/, '')),
  );

  if (someNegatedRole) return false;

  // Check whether every role is negated.
  const everyNegatedRoles = rolesArr.every((role) => /^!/.exec(role));

  if (everyNegatedRoles) return obj;

  // Some positive role is included in user_roles[]
  const somePositiveRole = rolesArr.some((role) => user_roles.includes(role));

  if (somePositiveRole) return obj;

  // The check fails by default.
  return false;
}

/**
@function objMerge

@description
Recursively merges role-specific object properties based on user roles.
The function handles several special cases:
- Recursively processes nested objects
- Handles arrays by mapping over their elements
- Processes negated roles (prefixed with '!')
- Preserves the original object if conditions aren't met
- Skip null or undefined values

```js
const obj = {
  name: 'layer',
  roles: {
    admin: { secretField: 'sensitive' },
    user: { publicField: 'visible' }
  }
};

// With admin role
objMerge(obj, ['admin']); 
// Returns: { name: 'layer', secretField: 'sensitive', roles: {...} }

// With user role
objMerge(obj, ['user']);
// Returns: { name: 'layer', publicField: 'visible', roles: {...} }
```
@param {Object} obj The object to process
@param {Array<string>} user_roles Array of roles assigned to the user
@property {roles} obj.roles Role configuration object
@returns {Object} Processed object with merged role-specific properties
*/
export function objMerge(obj, user_roles) {
  if (typeof obj !== 'object') return obj;

  if (!Array.isArray(user_roles)) return obj;

  if (Array.isArray(obj)) {
    return obj.map((arrEntry) => objMerge(arrEntry, user_roles));
  }

  Object.keys(obj)
    .filter((key) => typeof obj[key] === 'object')
    .forEach((key) => {
      // Cannot convert undefined or null to object.
      if (!obj[key]) return;

      obj[key] = objMerge(obj[key], user_roles);
    });

  if (!obj.roles) return obj;

  if (typeof obj.roles !== 'object') return obj;

  if (Array.isArray(obj.roles)) return obj;

  if (typeof obj.roles === 'function') return obj;

  const clone = structuredClone(obj);

  Object.keys(clone.roles)
    .filter((role) => clone.roles[role] !== true)
    .filter((role) => clone.roles[role] !== null)
    .filter((role) => typeof clone.roles[role] === 'object')
    .filter((role) => !Array.isArray(clone.roles[role]))
    .filter((role) => {
      // Get last role from a dot tree role string.
      const popRole = role.split('.').pop();

      return (
        user_roles.includes(popRole) ||
        notIncludesNegatedRole(popRole, user_roles)
      );
    })
    .forEach((role) => {
      merge(clone, clone.roles[role]);
    });

  return clone;
}

/**
@function notIncludesNegatedRole

@description
The utility method checks whether a negated role [prefixed with an exclamation mark !] is not included in the array of user roles.

@param {String} role A role name
@param {Array<string>} user_roles Array of roles assigned to the user
@returns {Boolean} True if the negated role is not included in the user_roles array.
*/
function notIncludesNegatedRole(role, user_roles) {
  // A negated role is prefixes with an exclamation mark.
  return role.match(/(?<=^!)(.*)/g)?.[0]
    ? !user_roles.includes(role.match(/(?<=^!)(.*)/g)?.[0])
    : false;
}

/**
@function objectRoles

@description
The objectRoles method has been designed to iterate through all nested objects in a workspace and add any keys in a 'roles' object property to a Set of role strings.

@param {set} rolesSet Set of role strings for each individual role. The same role cannot be added twice to a set.
@param {object} obj Object to evaluate for roles.
@param {string} key Key value of current object.
*/
export function fromObj(rolesSet, obj) {
  // Iterate through the object tree.
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object') {
      if (key === 'roles') {
        Object.keys(obj[key]).forEach((role) => {
          // Add role without negation ! to roles set.
          // The same s.role can not be added multiple times to the rolesSet.
          rolesSet.add(role.replace(/^!/, ''));
        });
      }

      // Call method recursive for nested objects.
      fromObj(rolesSet, obj[key]);
    }
  });
}
