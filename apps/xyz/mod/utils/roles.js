/**
## /utils/roles
Roles utility module exports methods to inspect roles in object, checking object access, and merging roles objects based on provided user roles.

@requires /utils/merge
@module /utils/roles
*/

/**
@global
@typedef {Object} roles
@property {Object} roles - roles configuration object
@property {boolean} [roles.*] - Wildcard role indicating unrestricted access
@property {Object} [roles.key] - Role-specific properties to merge
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
```

The check is also passed if the obj does not have a roles property.

@param {Object} obj The object to check access for
@param {Array<string>} user_roles Array of roles assigned to the user
@property {roles} obj.roles Role configuration object
@returns {boolean} Returns true if check is passed, false otherwise.
*/
export function check(obj, user_roles) {
  // The object to check has no roles assigned.
  if (!obj.roles) return true;

  // The roles object maybe empty.
  if (!Object.keys(obj.roles).length) return true;

  if (!user_roles) return false;

  // user_roles must be an array or true
  if (!Array.isArray(user_roles)) return true;

  // Always return object with '*' asterisk role.
  if (Object.hasOwn(obj.roles, '*')) return true;

  // Add last of dot notation role to rolesArr
  const rolesArr = Object.keys(obj.roles);

  // Pop last role from dot notation roles into rolesArr for backwards compatibility.
  Object.keys(obj.roles).forEach((role) =>
    rolesArr.push(role.split('.').pop()),
  );

  // Some positive role is included in user_roles[]
  const somePositiveRole = rolesArr.some((role) => user_roles.includes(role));

  if (somePositiveRole) return true;

  // The check fails by default.
  return false;
}

/**
@function objMerge

@description
The objMerge method recursively merges roles object properties with the object.

The method will short circuit if the obj param is not an object or if the user_roles param is not an array.

The roles object role property must be an object and not an array.

In the following example, the display true property will be merged into the object containing the roles object if the 'display' role is provided in the user_roles array param.

```
roles: {
  display: {
    display: true
  }
}
```

Only structured clones of objects are merged and returned. Workspace templates must not be modified to acknlowledge user roles associated with a request.

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

  if (Array.isArray(obj.roles)) return obj;

  if (typeof obj.roles !== 'object') return obj;

  const clone = structuredClone(obj);

  for (const role in clone.roles) {
    if (clone.roles[role] === true) continue;
    if (clone.roles[role] === null) continue;
    if (Array.isArray(clone.roles[role])) continue;
    if (typeof clone.roles[role] !== 'object') continue;

    // Get last role from a dot tree role string.
    const popRole = role.split('.').pop();

    if (!user_roles.includes(popRole)) continue;

    merge(clone, clone.roles[role]);
  }

  return clone;
}

/**
@function setInObj

@description
The setInObj receives a set of roles and an object as params.

The method iterates through the object keys and will call itself for every object type property in the object param.

Any roles defined in the roles property of the object param will be added to the rolesSet param.

The method does not return anything but will modify the rolesSet param which is passed recursively.

Access roles defined as the role string property will also be added to the rolesSet.

@param {set} rolesSet Set of roles to be modified while the param is passed recursively.
@param {object} obj Object to evaluate for roles.
@property {object} [obj.roles] Roles in the object will be added to the rolesSet.
@property {string} [obj.role] Any [template] access role will be added to the rolesSet.
*/
export function setInObj(rolesSet, obj) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object') {
      if (key === 'roles') {
        Object.keys(obj[key]).forEach((role) => {
          // The same role can not be added multiple times to the rolesSet.
          rolesSet.add(role);
        });
      }

      // Call method recursively for object properties of the object param.
      setInObj(rolesSet, obj[key]);

      // Add string type obj.role property to the rolesSet.
    } else if (key === 'role' && typeof obj[key] === 'string') {
      rolesSet.add(obj[key]);
    }
  });
}

/**
@function combine
@description
Combines roles from a parent object into a child object.
Handles two use cases:
1. Template role assignment (when parent has localeRole, templateRole, or objRole properties)
2. Simple parent-child role combination (for nested locales)

@param {Object} child The child object (template or locale).
@param {Object} parent The parent object providing role context.
*/
export function combine(child, parent) {
  // Handle template-style role assignment
  // Template context has special properties: localeRole, templateRole, objRole
  if (
    child.role &&
    (parent.localeRole ||
      parent.templateRole ||
      parent.objRole ||
      child.objRole)
  ) {
    combineTemplateRoles(child, parent);
    return;
  }

  // Handle simple locale-style role combination
  combineObjRoles(child, parent);
}

/**
@function combineTemplateRoles
@description
Combines roles for templates. This replicates the old roleAssign behavior.

Templates may have an access role restriction. The `template.role` string property requires a user to have that role in order to access the template.

The role string will be added as boolean:true property to the `template.roles` object property if the property key is undefined.

`template.role = 'bar' -> template.roles = {'bar':true}`

A dot notation role key will be created if the obj has a role string property.

`obj.role = 'foo' && template.role = 'bar' -> template.roles = {'foo.bar':true}`

@param {Object} template The template object (child).
@param {Object} obj The parent object providing role context.
*/
function combineTemplateRoles(template, obj) {
  if (!template.role) return;

  template.roles ??= {};
  template.roles[template.role] ??= true;

  // Filter out undefined roles and duplicates from roles array.
  const roleArr = Array.from(
    new Set(
      [obj.localeRole, obj.role, obj.templateRole, template.role].filter(
        (role) => typeof role === 'string',
      ),
    ),
  );

  // Join roles array into the template.roles.
  if (roleArr.length) {
    template.roles[roleArr.join('.')] ??= true;
  }

  obj.roles ??= {};

  // Concatenate the template.role to each obj.roles{} key where the last role does not match the template.objRole.
  for (const role of Object.keys(obj.roles)) {
    const tailRole = role.split('.').pop();
    if (tailRole !== template.objRole) {
      continue;
    }
    template.roles[`${role}.${template.role}`] ??= true;
  }

  if (Array.isArray(template.templates)) {
    template.templateRole = template.role;
    for (const templatesTemplate of template.templates) {
      if (typeof templatesTemplate !== 'object') continue;
      templatesTemplate.objRole = template.role;
    }
  } else {
    delete obj.templateRole;
  }
}

/**
@function combineObjRoles
@description
Combines roles for nested objects, such as locales.

@param {Object} child Nested object.
@param {Object} parent Parent object.
*/
function combineObjRoles(child, parent) {
  if (!parent || !child) return;

  const childRole = typeof child.role === 'string' ? child.role : undefined;
  const parentRole = typeof parent.role === 'string' ? parent.role : undefined;

  // Assign child.role string property to child.roles object property.
  if (childRole) {
    child.roles ??= {};
    child.roles[childRole] ??= true;
  }

  // Assign parent.role string property to parent.roles object property.
  if (parentRole) {
    parent.roles ??= {};
    parent.roles[parentRole] ??= true;
  }

  // Nested roles will only be created if both parent and child have a role string property defined. This is to prevent unnecessary role combinations for objects that do not have role restrictions.
  if (!childRole || !parentRole) return;

  // Get parent roles that match the parent role or end with the parent role.
  const parentRoles = Object.keys(parent.roles).filter((role) => {
    return (
      role === parentRole ||
      role.split('.').pop() === parentRole ||
      parentRole.endsWith(`.${role}`)
    );
  });

  // Create nested child role keys in child.roles object property by concatenating parent role keys with the child role string.
  parentRoles.forEach((role) => {
    child.roles[`${role}.${childRole}`] ??= true;
  });
}
