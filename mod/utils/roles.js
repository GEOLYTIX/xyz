module.exports = {
  check,
  filter,
  get
}

function check(obj, roles) {

  if (!obj.roles) return obj

  // Roles must be an array.
  if (!Array.isArray(roles)) return false

  // Check whether negated role is matched with user.
  const someNegatedRole = Object.keys(obj.roles)
    .some(role => /^!/.exec(role) && roles.includes(role.replace(/^!/, '')))

  // Return undefined if some negated role is matched.
  if (someNegatedRole) return false
  
  // Check whether every role is negated.
  const everyNegatedRoles = Object.keys(obj.roles)
    .every(role => /^!/.exec(role))
  
  // Return locale if every role is negated.
  if (everyNegatedRoles) return obj
  
  // Check if some positive role is matched.
  const somePositiveRole = Object.keys(obj.roles)
    .some(role => roles.includes(role))
  
  // Return locale if some positive role is matched.
  if (somePositiveRole) return obj
  
  return false
}

// Return filter objects for user_roles matched with layer.roles
function filter(layer, user_roles) {

  if (!layer.roles) return;

  // Roles must be an array.
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

  return Array.from(roles)
}