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
  }

  // The _template can be a string or object [with src]
  for (const _template of obj.templates || []) {
    obj = await objTemplate(obj, _template, roles, true);
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

The template will be merged into the obj with the reverse flag.

@param {Object} obj 
@param {Object} template The template maybe an object with a src property or a string. 
@param {array} roles An array of user roles from request params. 
@param {boolean} reverse Whether template should be merged into the obj, not the other way around.

@returns {Promise<Object>} Returns the merged obj.
*/
async function objTemplate(obj, template, roles, reverse) {
  template = await getTemplate(template);

  // Failed to get template matching obj.template from template.src!
  if (template instanceof Error) {
    obj.err ??= [];
    obj.err.push(template.message);
    return obj;
  }

  if (Roles.check(template, roles)) {
    template = structuredClone(template);

    template = Roles.objMerge(template, roles);

    if (reverse) {
      //The object key must not be overwritten by a template key.
      delete template.key;

      //The object template must not be overwritten by a templates template.
      delete template.template;

      // Merge template --> obj
      return merge(obj, template);
    } else {
      // Merge obj --> template
      // Template must be cloned to prevent cross polination and array aggregation.
      return merge(template, obj);
    }
  }

  // Return empty object if Roles.check fails to prevent subsequent object from crashing on undefined.
  return new Error('Role check failed.');
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
