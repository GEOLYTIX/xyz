/**
## /workspace/composeObj

@module /workspace/composeObj
*/

import merge from '../utils/merge.js';
import workspaceCache from './cache.js';
import getTemplate from './getTemplate.js';

let workspace;

/**
@function composeObj
@async

@description

@param {Object} obj
@param {array} [roles] An array of user roles from request params.

@property {string} [obj.template] Key of template for the object.
@property {array} [obj.templates] An array of template keys to be merged into the object.
*/
export default async function composeObj(obj, roles) {
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

  workspace.scopes.add(templateScope);

  if (!checkScope(templateScope, roles)) {
    return new Error(
      `User does not have access to object with template scope: ${templateScope.join('.')}`,
    );
  }

  const rolesCheck = await parseTemplates(obj, roles, templateScope);

  if (rolesCheck instanceof Error) {
    return rolesCheck;
  }

  return obj;
}

/**
@function mergeTemplateIntoObj
@async

@description

@param {Object} obj
@param {Object} template The template maybe an object with a src property or a string.
@param {array} [roles] An array of user roles from request params.
@param {array} [templateScope] The templateScope is an array that represents nested template roles/scope.

@returns {Promise<Object>} Returns the merged obj.
*/
async function mergeTemplateIntoObj(obj, template, roles, templateScope = []) {
  template = await getTemplate(template);

  if (template instanceof Error) {
    obj.err ??= [];
    obj.err.push(template.message);
    return;
  }

  template = filterTemplateProperties(template);

  // The templateScope array must be spread into a new array to prevent the original templateScope from being modified by nested templates.
  templateScope = [...templateScope, template.role];

  workspace.scopes.add(templateScope);

  templateScope = templateScope.filter(Boolean);

  if (!checkScope(templateScope, roles)) {
    return;
  }

  const rolesCheck = await parseTemplates(template, roles, templateScope);

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
      if (template.hasOwnProperty(prop)) {
        delete template[prop];
      }
    }
  }
  delete template.exclude_props;
  if (Array.isArray(template.include_props)) {
    const _template = {};
    for (const prop of template.include_props) {
      if (template.hasOwnProperty(prop)) {
        _template[prop] = template[prop];
      }
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
@param {Object} roles
@param {array} templateScope
*/
async function parseTemplates(obj, roles, templateScope) {
  if (typeof obj !== 'object') return;

  if (obj === null) return;

  if (obj === undefined) return;

  for (const [key, val] of Object.entries(obj)) {
    if (queryTemplate(key, val, obj, roles, templateScope)) {
      continue;
    }

    if (await templatesArray(key, val, obj, roles, templateScope)) {
      continue;
    }

    const rolesTemplatesCheck = await rolesTemplates(
      key,
      val,
      obj,
      roles,
      templateScope,
    );

    if (rolesTemplatesCheck === true) {
      continue;
    }

    if (rolesTemplatesCheck instanceof Error) {
      return rolesTemplatesCheck;
    }

    // Recursively process each item in an array property of the object.
    if (await arrayProperty(key, val, obj, roles, templateScope)) {
      continue;
    }

    // Recursively process nested objects
    const parseTemplatesCheck = await parseTemplates(val, roles, templateScope);
    if (parseTemplatesCheck instanceof Error) {
      delete obj[key];
    }
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
@param {array} roles
@param {array} templateScope
@returns {boolean} Returns true if the key is 'template' and the val has a key property.
*/
function queryTemplate(key, val, obj, roles, templateScope) {
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
@param {array} roles
@param {array} templateScope
@returns {boolean} Returns true if the key is 'templates' and the val is an array.
*/
async function templatesArray(key, val, obj, roles, templateScope) {
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
    await mergeTemplateIntoObj(obj, template, roles, templateScope);
  }

  return true;
}

/**
@function rolesTemplates
@async

@description
The rolesTemplates method processes the 'roles' property of an object. It iterates over each role and merges the corresponding template into the object if the role value is true or an object.

The role as defined by the key in the roles object will be added to the accessRoles array. Access to the obj will be denied if none of the accessRoles are included in the roles array provided by the user.

@param {string} key
@param {Object} val
@param {Object} obj
@param {array} roles
@param {array} templateScope
@returns {boolean} 
*/
async function rolesTemplates(key, val, obj, roles, templateScope) {
  if (key !== 'roles') return false;

  // The roles property value must be an object. If the value is true, null, or not an object, access to the obj will be denied.
  if (typeof val !== 'object' || val === true || !val) return false;

  delete obj.roles;

  const accessRoles = [];

  for (const [roleKey, roleVal] of Object.entries(val)) {
    // Check for accessRoles in the roles object.
    if (roleVal === true || roleVal === null) {
      accessRoles.push(roleKey);
      continue;
    }

    // Check for template roles in the roles object.
    if (typeof roleVal !== 'object') continue;
    const template = {
      role: roleKey,
      ...roleVal,
    };
    await mergeTemplateIntoObj(obj, template, roles, templateScope);
    accessRoles.push(roleKey);
  }

  if (roles === true) {
    accessRoles.forEach((role) => {
      workspace.scopes.add([...templateScope, role]);
    });
    // Role check is not required for admin endpoints. The roles parameter is set to true to bypass role checks.
    return true;
  }

  if (!roles) {
    return new Error(
      'Access to the object with the roles property is denied. No roles were provided.',
    );
  }

  // Access to the object is granted if the accessRoles array includes a wildcard role '*'. This allows for unrestricted access to the object regardless of the user's roles.
  if (accessRoles.includes('*')) return true;

  // At least one of the accessRoles must be included in the roles array provided by the user. If not, access to the obj will be denied.
  if (accessRoles.some((role) => roles.includes(role))) {
    return true;
  } else {
    return new Error(
      `Access to the object with the roles property is denied. User does not have any of the required accessRoles: ${accessRoles.join(', ')}`,
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
@param {array} roles
@param {array} templateScope
@returns {boolean} 
*/
async function arrayProperty(key, val, obj, roles, templateScope) {
  if (!Array.isArray(val)) return false;

  // Do not process the layers when a locale is being composed. The layers will be processed in the getLayer method.
  if (key === 'layers') return true;

  const kept = [];
  for (const item of val) {
    const rolesCheck = await parseTemplates(item, roles, templateScope);
    if (!(rolesCheck instanceof Error)) kept.push(item);
  }
  obj[key] = kept;
  return true;
}

/**
@function checkScope

@description
The checkScope method checks whether the user has access to the object based on the provided roles and templateScope.

If the roles parameter is undefined, the method will return undefined.

If the roles parameter is true, the method will return true.

If the roles parameter is an array, the method will check whether the templateScope string is included in the roles array. If so, it will return true.

@param {array} templateScope
@param {array} roles
@returns {boolean} Returns true if the user has access based on the roles and templateScope.
*/
function checkScope(templateScope, roles) {
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
  if (
    roles.findIndex((role) => role.startsWith(`${templateScopeString}.`)) > -1
  ) {
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
