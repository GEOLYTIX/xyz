/**
@module /utils/roles
*/

const merge = require('./merge')

module.exports = {
  check,
  get,
  objMerge
}

function check(obj, user_roles) {

  // The object to check has no roles assigned.
  if (!obj.roles) return obj;

  // Always return object with '*' asterisk role.
  if (Object.hasOwn(obj.roles, '*')) return obj;

  if (user_roles === undefined) return false

  // Some negated role is included in user_roles[]
  const someNegatedRole = Object.keys(obj.roles).some(
    (role) => /^!/.exec(role) && user_roles.includes(role.replace(/^!/, ""))
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
@function get

@description
The roles.get() method parses the object argument for nested roles properties.

Any key from a roles object will added to Set and returned as an array from the method.

@param {Object} obj Workspace object to parse for roles.

@returns {Array} Returns an array of role keys from the workspace.
*/
function get(obj) {

  const roles = new Set();

  (function objectEval(o, parent, key) {

    if (key === 'roles') {
      Object.keys(parent.roles).forEach(role => {

        // Add role without nagation ! to roles set.
        // The same role can not be added multiple times to the roles set.
        roles.add(role.replace(/^!/, ''))
      })
    }

    // Iterate through the object tree.
    Object.keys(o).forEach((key) => {
      if (o[key] && typeof o[key] === 'object') {

        // Call method recursive for nested objects.
        objectEval(o[key], o, key)
      }
    });

  })(obj)

  // Delete restricted Asterisk role.
  roles.delete('*')

  return Array.from(roles)
}

function objMerge(obj, user_roles) {

  if (typeof obj !== 'object') return obj;

  if (user_roles === undefined) return obj

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

    return role.match(/(?<=^!)(.*)/g)?.[0]?
      !user_roles.includes(role.match(/(?<=^!)(.*)/g)?.[0]):
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

  delete clone.roles

  return clone
}