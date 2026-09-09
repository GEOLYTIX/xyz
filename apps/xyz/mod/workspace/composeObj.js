/**
## /workspace/composeObj

@requires /utils/merge
@requires /workspace/authorization
@requires /workspace/cache
@requires /workspace/getTemplate

@module /workspace/composeObj
*/

import merge from '../utils/merge.js';
import { authorizeScope } from './authorization.js';
import workspaceCache from './cache.js';
import getTemplate from './getTemplate.js';

let workspace;

/**
@function composeObj
@async

@description
The composeObj method is the main entry point for composing an object with templates and roles. It will recursively traverse the provided object and its nested objects to identify and process template definitions.

@param {Object} obj
@param {User} [user] The requesting user from request params.

@property {string} [obj.template] Key of template for the object.
@property {array} [obj.templates] An array of template keys to be merged into the object.
@property {array<string>|boolean} [user.roles] An array of user roles. Admin endpoints set the roles property to true to bypass role checks.
*/
export default async function composeObj(obj, user) {
  // Cache workspace in module scope for template assignment.
  workspace = await workspaceCache();

  if (obj.template) {
    let template = await getTemplate(obj.template);

    if (template instanceof Error) {
      return template;
    }

    template = filterTemplateProperties(template);

    delete obj.template;
    delete template.src;

    // Merge obj --> template
    obj = merge(template, obj);
  }

  obj.parentRoles ??= [];

  const templateScope = [...obj.parentRoles, obj.role].filter(Boolean);

  workspace.scopes.add(templateScope.join('.'));

  const allowed = await authorizeScope({
    obj,
    scope: [...templateScope],
    scopeKey: templateScope.join('.'),
    user,
  });

  if (!allowed) {
    return new Error(
      `User does not have access to object with template scope: ${templateScope.join('.')}`,
    );
  }

  // The obj is the root object of the composition. The root obj is gated by every role key in a roles object.
  const rolesCheck = await parseTemplates(obj, user, templateScope, true);

  if (rolesCheck instanceof Error) {
    return rolesCheck;
  }

  return obj;
}

/**
@function mergeTemplateIntoObj
@async

@description
The mergeTemplateIntoObj method merges a template into an object. It first retrieves the template using the getTemplate method, then filters the template properties using the filterTemplateProperties method.

@param {Object} obj
@param {Object} template The template maybe an object with a src property or a string.
@param {User} [user] The requesting user from request params.
@param {array} [templateScope] The templateScope is an array that represents nested template roles/scope.

@returns {Promise<Object>} Returns the merged obj.
*/
async function mergeTemplateIntoObj(obj, template, user, templateScope = []) {
  template = await getTemplate(template);

  if (template instanceof Error) {
    obj.err ??= [];
    obj.err.push(template.message);
    return;
  }

  template = filterTemplateProperties(template);

  // The templateScope array must be spread into a new array to prevent the original templateScope from being modified by nested templates.
  templateScope = [...templateScope, template.role].filter(Boolean);

  workspace.scopes.add(templateScope.join('.'));

  const allowed = await authorizeScope({
    obj: template,
    scope: [...templateScope],
    scopeKey: templateScope.join('.'),
    user,
  });

  if (!allowed) {
    return;
  }

  const rolesCheck = await parseTemplates(template, user, templateScope);

  if (rolesCheck instanceof Error) {
    obj.warn ??= [];
    obj.warn.push(rolesCheck.message);
  }

  // key and role properties must not overwrite in obj.
  delete template.key;
  delete template.role;
  delete template.src;

  // Merge template --> obj
  obj = merge(obj, template);

  return obj;
}

/**
@function filterTemplateProperties

@description
The filterTemplateProperties method will first remove any properties defined in the template.exclude_props array from the template object.

If the template.include_props array is defined, only the properties defined in the include_props array will be retained in the template object.

@param {Object} template

@returns {Object} The template object with filtered properties.
*/
function filterTemplateProperties(template) {
  if (Array.isArray(template.exclude_props)) {
    for (const prop of template.exclude_props) {
      delete template[prop];
    }
  }
  delete template.exclude_props;
  if (Array.isArray(template.include_props)) {
    const _template = {};
    for (const prop of template.include_props) {
      _template[prop] = template[prop];
    }
    return _template;
  }
  delete template.include_props;
  return template;
}

/**
@function parseTemplates

@description
The parseTemplates method will recursively traverse the provided object and its nested objects to identify and process template definitions.

If a template object is found, it will be added to the workspace.templates object for later use. The template property will be removed from the object after processing.

If an array of templates is found, each template will be merged into the object in the order they are defined in the array.

@param {Object} obj
@param {User} [user] The requesting user from request params.
@param {array} templateScope
@param {boolean} [root] Whether the obj is the root object of the composeObj method.
*/
async function parseTemplates(obj, user, templateScope, root = false) {
  if (typeof obj !== 'object') return;

  if (obj === null) return;

  for (const key of Object.keys(obj)) {
    const parseKeyCheck = await parseKey(key, obj, user, templateScope, root);

    if (parseKeyCheck instanceof Error) {
      return parseKeyCheck;
    }
  }
}

/**
@function parseKey
@async

@description
The parseKey method processes a single key of an object parsed by the parseTemplates method.

The key value is checked against the queryTemplate, templatesArray, rolesTemplates, and arrayProperty methods in order. The first method to process the key value will short circuit the remaining checks. A key value which is not processed by any of these methods will be traversed recursively by the parseTemplates method.

@param {string} key
@param {Object} obj
@param {User} [user] The requesting user from request params.
@param {array} templateScope
@param {boolean} [root] Whether the obj is the root object of the composeObj method.

@returns {Promise<Error|undefined>} Returns an Error if the roles check for the obj fails.
*/
async function parseKey(key, obj, user, templateScope, root = false) {
  // The value must be read fresh on each iteration rather than destructured from a snapshot. Earlier keys in the parseTemplates loop (eg. a templates array) can merge into and reassign a not-yet-processed property (eg. infoj), and a stale val would overwrite that merge when this key is reached.
  const val = obj[key];

  // Locale object layers should never be processed. Layers will be processed in the getLayer method. The layers property will be removed from the locale object after processing.
  if (key === 'layers') return;

  if (queryTemplate(key, val, obj, user, templateScope)) return;

  if (await templatesArray(key, val, obj, user, templateScope)) return;

  const rolesTemplatesCheck = await rolesTemplates(
    key,
    val,
    obj,
    user,
    templateScope,
    root,
  );

  if (rolesTemplatesCheck === true) return;

  if (rolesTemplatesCheck instanceof Error) {
    return rolesTemplatesCheck;
  }

  // Recursively process each item in an array property of the object.
  if (await arrayProperty(key, val, obj, user, templateScope)) return;

  // Recursively process nested objects
  const parseTemplatesCheck = await parseTemplates(val, user, templateScope);

  if (parseTemplatesCheck instanceof Error) {
    delete obj[key];
  }
}

/**
@function queryTemplate

@description
The queryTemplate method checks if the key is 'template' and the val is a string or an object with a key property. If so, it will add the template to the workspace.templates object and remove the template property from the obj.

A prototype template into which the object will merged will only be processed if the template is defined in a layer or locale object. A prototype template will not be processed if it is nested in a template.

Access to an object is denied if the user does not have access to a prototype template. This would cause an object to fail if attempting to merge the object into the prototype template. Merging will not be attempted if the template with an access role is defined in a templates array.

@param {string} key
@param {Object} val
@param {Object} obj
@param {User} [user] The requesting user from request params.
@param {array} templateScope
@returns {boolean} Returns true if the key is 'template' and the val has a key property.
*/
function queryTemplate(key, val, obj, user, templateScope) {
  if (key !== 'template') return false;

  if (typeof val === 'string') {
    return true;
  }

  if (!val.key && typeof val.role === 'string') {
    val.warn ??= [];
    val.warn.push(`Role [${val.role}] template caught in queryTemplate check.`);
    return true;
  }

  if (!val.key && typeof val.src === 'string') {
    val.warn ??= [];
    val.warn.push(`SRC [${val.src}] template caught in queryTemplate check.`);
    return true;
  }

  if (!val.key) {
    val.warn ??= [];
    val.warn.push('Template without key caught in queryTemplate check.');
    return true;
  }

  // A query template object must be referenced by it's key in the obj properties values.
  if (!Object.values(obj).some((v) => v === val.key)) {
    val.warn ??= [];
    val.warn.push(
      `Key [${val.key}] template caught in queryTemplate check without reference in object properties.`,
    );
    return true;
  }

  // A template object provided in a template will be a query template to be merged into the workspace.templates object. The template will be assigned a _type property to identify it as a template object. Query templates are not merged into the object they are defined in but are assigned to the workspace.templates object for later use.
  val._type = 'template';
  workspace.templates[val.key] = Object.assign(
    workspace.templates[val.key] || {},
    val,
  );
  // The template is now referenced by it's key in the workspace.templates object. The template property is no longer needed on the object.
  delete obj.template;
  return true;
}

/**
@function templatesArray
@async

@description
The method checks if the key is 'templates' and the val is an array. If so, it will merge each template in the array into the object and remove the templates property from the obj.

@param {string} key
@param {Object} val
@param {Object} obj
@param {User} [user] The requesting user from request params.
@param {array} templateScope
@returns {Promise<boolean>} Returns true if the key is 'templates' and the val is an array.
*/
async function templatesArray(key, val, obj, user, templateScope) {
  if (key !== 'templates') return false;

  if (!Array.isArray(val)) {
    obj.warn ??= [];
    obj.warn.push(
      `'templates' property has value [${val}] which is not an array.`,
    );
    return false;
  }

  // Delete the templates property from the obj before merging the templates into the obj. This will prevent circular references when merging templates.
  delete obj.templates;

  for (const template of val) {
    // Merge template from templates array into the object. The templates will be merged in the order they are defined in the array.
    await mergeTemplateIntoObj(obj, template, user, templateScope);
  }

  return true;
}

/**
@function rolesTemplates
@async

@description
The rolesTemplates method processes the 'roles' property of an object. It iterates over each role and merges the corresponding template into the object if the role value is true or an object.

The role as defined by the key in the roles object will be added to the accessRoles array. This applies to true/null role values as well as object role values which merge role specific properties into the obj.

The root obj of the composeObj method (eg. a layer or locale) is gated by every accessRole. Access to the root obj will be denied if none of the accessRoles are included in the user.roles array. This matches the legacy roles check which gated a layer or locale by every role key.

A nested obj is only gated by the gateRoles defined with a true/null value. Object role values merge role specific properties into a nested obj which remains visible to a user without the role. This allows for a role specific property (eg. skipEntry) to be merged into an infoj entry for some users without hiding the entry from other users.

The user.roles gate does not apply to a user with an authorization_provider property. Scope access for such a user is decided by the provider in the authorizeScope method.

@param {string} key
@param {Object} val
@param {Object} obj
@param {User} [user] The requesting user from request params.
@param {array} templateScope
@param {boolean} [root] Whether the obj is the root object of the composeObj method.
@property {array|boolean} [user.roles] An array of user roles.
@returns {Promise<boolean>}
*/
async function rolesTemplates(key, val, obj, user, templateScope, root) {
  if (key !== 'roles') return false;

  const roles = user?.roles;

  // The roles property value must be an object. If the value is true, null, or not an object, access to the obj will be denied.
  if (typeof val !== 'object' || val === true || !val) return false;

  delete obj.roles;

  // Every roleKey in the roles object is an accessRole.
  const accessRoles = [];

  // gateRoles are roleKeys defined with a plain true/null value. A nested obj is only gated by these roles.
  const gateRoles = [];

  for (const [roleKey, roleVal] of Object.entries(val)) {
    // Check for accessRoles in the roles object.
    if (roleVal === true || roleVal === null) {
      accessRoles.push(roleKey);
      gateRoles.push(roleKey);
      continue;
    }

    // Check for template roles in the roles object.
    if (typeof roleVal !== 'object') continue;
    const template = {
      role: roleKey,
      ...roleVal,
    };
    await mergeTemplateIntoObj(obj, template, user, templateScope);
    accessRoles.push(roleKey);
  }

  if (roles === true) {
    accessRoles.forEach((role) => {
      workspace.scopes.add([...templateScope, role].filter(Boolean).join('.'));
    });
    // Role check is not required for admin endpoints. The user.roles property is set to true to bypass role checks.
    return true;
  }

  // A user with an authorization_provider property is not gated by the user.roles array. Scope access for the user is decided by the provider in the authorizeScope method.
  if (user?.authorization_provider) return true;

  // The root obj is gated by every accessRole. A nested obj is only gated by the gateRoles.
  const requiredRoles = root ? accessRoles : gateRoles;

  // The obj is not gated and remains visible regardless of the roles provided by the user.
  if (!requiredRoles.length) return true;

  // Access to the object is granted if the accessRoles array includes a wildcard role '*'. This allows for unrestricted access to the object regardless of the user's roles.
  if (accessRoles.includes('*')) return true;

  if (!roles) {
    return new Error(
      'Access to the object with the roles property is denied. No roles were provided.',
    );
  }

  // At least one of the requiredRoles must be included in the roles array provided by the user. If not, access to the obj will be denied.
  if (requiredRoles.some((role) => roles.includes(role))) {
    return true;
  } else {
    return new Error(
      `Access to the object with the roles property is denied. User does not have any of the required accessRoles: ${requiredRoles.join(', ')}`,
    );
  }
}

/**
@function arrayProperty
@async

@description
The arrayProperty method processes array properties of an object. It iterates over each item in the array and checks the roles for each item. If the roles check fails, the item is removed from the array.

@param {string} key
@param {Object} val
@param {Object} obj
@param {User} [user] The requesting user from request params.
@param {array} templateScope
@returns {Promise<boolean>}
*/
async function arrayProperty(key, val, obj, user, templateScope) {
  if (!Array.isArray(val)) return false;

  const kept = [];
  for (const item of val) {
    const rolesCheck = await parseTemplates(item, user, templateScope);
    if (!(rolesCheck instanceof Error)) kept.push(item);
  }
  obj[key] = kept;
  return true;
}
