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

  // There are no user roles or user_roles are not an array.
  if (!user_roles || !Array.isArray(user_roles)) return false;

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

function get(obj) {

  const roles = new Set();

  (function objectEval(o, parent, key) {

    if (key === 'roles') {
      Object.keys(parent.roles).forEach(role => {

        // Add role without nagation ! to roles set.
        roles.add(role.replace(/^!/, ''))

      })
    }

    // iterate through the object tree.
    Object.keys(o).forEach((key) => {
      if (o[key] && typeof o[key] === 'object') objectEval(o[key], o, key)
    });

  })(obj)

  // Delete restricted Asterisk role.
  roles.delete('*')

  return Array.from(roles)
}

function objMerge(obj, user_roles) {

  if (typeof obj !== 'object') return obj;

  if (!user_roles.length) return obj;

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

  clone = structuredClone(obj)

  for (const role in clone.roles) {

    if (clone.roles[role] === true) continue;

    if (clone.roles[role] === null) continue;

    if (typeof clone.roles[role] !== 'object') continue;

    if (user_roles.includes(role)) {
      merge(clone, clone.roles[role]);

    } else if (!user_roles.includes(role.match(/(?<=^!)(.*)/g)?.[0])) {
      merge(clone, clone.roles[role]);
    }
  }

  delete clone.roles

  return clone
}