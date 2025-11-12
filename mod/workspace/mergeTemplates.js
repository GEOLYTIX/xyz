/**
## /workspace/mergeTemplates

The workspace is cached in the module scope to allow for the mergeObjectTemplates(layer) method to assign template objects defined in a JSON layer to the workspace.templates{}.

@requires /utils/roles
@requires /utils/merge
@requires /utils/envReplace
@requires /workspace/getTemplate
@requires /workspace/cache

@module /workspace/mergeTemplates
*/

import envReplace from '../utils/envReplace.js';
import merge from '../utils/merge.js';
import * as Roles from '../utils/roles.js';
import workspaceCache from './cache.js';
import getTemplate from './getTemplate.js';

let workspace;

/**
@function mergeTemplates
@async

@description
The mergeTemplates method will be called for a layer or locale obj.

The locale or layer object will be merged with a template defined as obj.template string property.

The method will check for a template matching the obj.key string property if obj.template is undefined.

An array of templates can be defined as obj.templates[]. The templates will be merged into the obj in the order the template keys are in the templates[] array.

@param {Object} obj 
@param {array} [roles] An array of user roles from request params.

@property {string} [obj.template] Key of template for the object.
@property {string} obj.key Fallback for lookup of template if not an implicit property.
@property {array} [obj.templates] An array of template keys to be merged into the object.

@returns {Promise} The layer or locale provided as obj param.
*/
export default async function mergeTemplates(obj, roles) {
  // Cache workspace in module scope for template assignment.
  workspace = await workspaceCache();

  // The object has an implicit template to merge into.
  if (typeof obj.template === 'string' || obj.template instanceof Object) {
    obj = await objTemplate(obj, obj.template, roles);
    if (obj instanceof Error) return obj;
  } else if (Array.isArray(obj.templates)) {
    // The _template can be a string or object [with src]
    for (const _template of obj.templates) {
      obj = await objTemplate(obj, _template, roles);
    }
  } else if (obj.templates instanceof Object) {
    const err = `${obj.key} Object must be a templates Array.`;
    obj.err ??= [];
    obj.err.push(err);
    console.warn(err);
  }

  // This must happen after the template merge which will assign the localeRole.
  if (typeof obj.role === 'string') {
    if (
      typeof obj.localeRole === 'string' &&
      !obj.role.startsWith(`${obj.localeRole}.`)
    ) {
      obj.role = `${obj.localeRole}.${obj.role}`;
    }
    obj.roles ??= {};
    obj.roles[obj.role] ??= true;
  }

  // Substitute ${SRC_*} in object string.
  obj = envReplace(obj);

  // Assign templates to workspace.
  assignWorkspaceTemplates(obj);

  // Assign default workspace dbs if not defined in template.
  obj.dbs ??= workspace.dbs;

  return obj;
}

/**
@function objTemplate
@async

@description
The method will request a template object from the getTemplate module method.

Possible error from the template fetch will be added to the obj.err[] array before the obj is returned.

The template will be checked against the request user roles.

The method will shortcircuit if roles restrict access to the template object.

Otherwise the obj will be merged into the template.

Templates defined in the obj.templates array will be merged into object.

@param {Object} obj 
@param {Object} template The template maybe an object with a src property or a string. 
@param {array} roles An array of user roles from request params.
@property {string} [obj.template] Key of template for the object.

@returns {Promise<Object>} Returns the merged obj.
*/
async function objTemplate(obj, template, roles) {
  template = await getTemplate(template);

  // Failed to get template matching obj.template from template.src!
  if (template instanceof Error) {
    obj.err ??= [];
    obj.err.push(template.message);
    return obj;
  }

  template = structuredClone(template);

  roleAssign(obj, template);

  if (roles !== true && !Roles.check(template, roles)) {
    if (obj.template) {
      obj.roles = {
        ...template.roles,
        ...obj.roles,
      };
    }
    return obj;
  }

  template = Roles.objMerge(template, roles);

  //use the base obj exclude/include props as we need that for the templateProperties method.
  template.exclude_props = obj.exclude_props ?? template.exclude_props;
  template.include_props = obj.include_props ?? template.include_props;

  template = templateProperties(template);

  let templates;

  if (obj.template) {
    // obj.template must NOT overwrite template.template.
    delete obj.template;
    // Merge obj --> template
    obj = merge(template, obj);

    if (obj.templates) {
      templates = obj.templates;
      delete obj.templates;
    }
  } else {
    if (Array.isArray(template.templates)) {
      templates = template.templates;
      delete template.templates;
    }

    // template.role must NOT overwrite obj.role.
    delete template.role;

    // template.key must NOT overwrite obj.key.
    delete template.key;

    // template.template must NOT overwrite obj.template.
    delete template.template;

    // Merge template --> obj
    obj = merge(obj, template);
  }

  if (obj.template) {
    obj = objTemplate(obj, obj.template, roles);
  } else if (Array.isArray(templates)) {
    for (const _template of templates) {
      obj = await objTemplate(obj, _template, roles);
    }
  }

  return obj;
}

/**
@function roleAssign

@description
Templates may have an access role restriction. The `template.role` string property requires a user to have that role in order to access the template.

The role string will be added as boolean:true property to the `template.roles` object property if the property key is undefined.

`template.role = 'bar' -> template.roles = {'bar':true}`

A dot notation role key will be created if the obj has a role string property.

`obj.role = 'foo' && template.role = 'bar' -> template.roles = {'foo.bar':true}`

@param {Object} obj 
@param {Object} template The template maybe an object with a src property or a string. 
@property {string} template.role The template has an access role restriction.
*/
function roleAssign(obj, template) {
  if (!template.role) return;

  template.roles ??= {};
  template.roles[template.role] ??= true;

  obj.roles ??= {};

  const roleArr = Array.from(
    new Set(
      [obj.localeRole, obj.role, obj.templateRole, template.role].filter(
        (role) => typeof role === 'string',
      ),
    ),
  );

  if (roleArr.length) {
    template.roles[roleArr.join('.')] ??= true;
  }

  for (const role of Object.keys(obj.roles)) {
    if (!template.role) continue;
    const tailRole = role.split('.').pop();
    if (tailRole !== obj.role) continue;
    if (!role.endsWith(`${obj.role}`)) continue;
    template.roles[`${role}.${template.role}`] ??= true;
  }

  if (template.templates) {
    template.templateRole = template.role;
  } else {
    delete template.templateRole;
  }
}

/**
@function assignWorkspaceTemplates

@description
The method parses an object for a template object property. 

The template property value will be assigned to the workspace.templates{} object matching the template key value.

The template._type property will be set to 'template' indicating that the templates origin is in the workspace. 

It is possible to overassign _type:'core' templates which are loaded from the /mod/workspace/templates directory.

The method will call itself for nested objects.

@param {Object} obj 
*/
function assignWorkspaceTemplates(obj) {
  // Return early if object is null or empty
  if (obj === null) return;

  if (obj instanceof Object && !Object.keys(obj)) return;

  Object.entries(obj).forEach((entry) => {
    // Process template objects - if found, add type and merge into workspace templates
    if (entry[0] === 'template' && entry[1].key) {
      entry[1]._type = 'template';
      workspace.templates[entry[1].key] = Object.assign(
        workspace.templates[entry[1].key] || {},
        entry[1],
      );

      return;
    }

    // Recursively process each item if we find an array
    if (Array.isArray(entry[1])) {
      entry[1].forEach(assignWorkspaceTemplates);
      return;
    }

    // Recursively process nested objects
    if (entry[1] instanceof Object) {
      assignWorkspaceTemplates(entry[1]);
    }
  });
}

/**
@function templateProperties

@description
The method checks whether the template object has an array property include_props and will iterate through the string entries in the array to remove all other properties from the template object.

Properties defined in the template object exclude_props array property will removed from the template object.
@param {Object} template
@property {array} template.include_props Remove all but these properties from template object.
@property {array} template.exclude_props Remove these properties from template object.
@returns {Object} template
*/
function templateProperties(template) {
  if (Array.isArray(template.exclude_props)) {
    for (const prop of template.exclude_props) {
      if (template.hasOwnProperty(prop)) {
        delete template[prop];
      }
    }
  }
  if (Array.isArray(template.include_props)) {
    const _template = {};
    for (const prop of template.include_props) {
      if (template.hasOwnProperty(prop)) {
        _template[prop] = template[prop];
      }
    }
    return _template;
  }
  return template;
}
