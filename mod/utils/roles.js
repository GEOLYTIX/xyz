/**
@module /utils/roles
*/

module.exports = {
  check,
  filter,
  get
}

function check(obj, user_roles) {

  // The object to check has no roles assigned.
  if (!obj.roles) return obj;

  // Always return object with '*' asterisk role.
  if (Object.hasOwn(obj.roles,'*')) return obj;

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

// Return an object with filter matching the layer.roles with user_roles.
function filter(layer, user_roles) {

  // The layer must have roles.
  if (!layer.roles) return;

  // user_roles must be an array.
  if (!Array.isArray(user_roles)) return;

  const roleFilter = Object.keys(layer.roles)
  
    // filter roles with a filter object.
    .filter(key => layer.roles[key] && typeof layer.roles[key].filter === 'object')

    // filter roles included in the user_roles array.
    .filter(key => user_roles.includes(key)

      // or negated roles (!) NOT included in the array.
      || !user_roles.includes(key.match(/(?<=^!)(.*)/g)?.[0]))
      
    .reduce((o, key) => {
      o[key] = layer.roles[key].filter
      return o
    }, {})

  return roleFilter
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