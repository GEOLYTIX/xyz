module.exports = {
  check: check,
  reduce: reduce,
  filter: filter,
}

function check(obj, roles) {

  if (!obj.roles) return obj

  if (!roles) return false

  // Check whether negated role is matched with user.
  const someNegatedRole = Object.keys(obj.roles)
    .some(role => role.match(/^\!/) && roles.includes(role.replace(/^\!/, "")))

  // Return undefined if some negated role is matched.
  if (someNegatedRole) return false
  
  // Check whether every role is negated.
  const everyNegatedRoles = Object.keys(obj.roles)
    .every(role => role.match(/^\!/))
  
  // Return locale if every role is negated.
  if (everyNegatedRoles) return obj
  
  // Check if some positive role is matched.
  const somePositiveRole = Object.keys(obj.roles)
    .some(role => roles.includes(role))
  
  // Return locale if some positive role is matched.
  if (somePositiveRole) return obj
  
  return false
}

async function reduce(obj, roles) {

  if (!roles) return;

  (function objectEval(o, parent, key) {

    if (!check(o, roles)) {
      // if the parent is an array splice the key index.
      if (parent.length > 0) return parent.splice(parseInt(key), 1)

      // if the parent is an object delete the key from the parent.
      return delete parent[key]
    }

    // iterate through the object tree.
    Object.keys(o).forEach((key) => {
      if (o[key] && typeof o[key] === 'object') objectEval(o[key], o, key)
    });

  })(obj)

}

function filter(obj, roles) {

  if (!obj.roles) return;

  if (!roles) return;

  const roleFilter = Object.keys(obj.roles)
    .filter(key => roles.includes(key)
      || key.match(/^\!/) && !roles.includes(key.replace(/^\!/, "")))
    .filter(key => !!obj.roles[key])
    .reduce((o, key) => {
      o[key] = obj.roles[key]
      return o
    }, {})

  return roleFilter
}