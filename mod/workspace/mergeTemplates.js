/**
## /workspace/mergeTemplates

The workspace is cached in the module scope to allow for the mergeObjectTemplates(layer) method to assign template objects defined in a JSON layer to the workspace.templates{}.

@requires /utils/merge
@requires /utils/envReplace
@requires /workspace/getTemplate
@requires /workspace/cache

@module /workspace/mergeTemplates
*/

import merge from '../utils/merge.js';

import envReplace from '../utils/envReplace.js';

import getTemplate from './getTemplate.js';

import workspaceCache from './cache.js';

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

@property {string} [obj.template] Key of template for the object.
@property {string} obj.key Fallback for lookup of template if not an implicit property.
@property {array} [obj.templates] An array of template keys to be merged into the object.

@returns {Promise} The layer or locale provided as obj param.
*/
export default async function mergeTemplates(obj) {
  // Cache workspace in module scope for template assignment.
  workspace = await workspaceCache();

  // The object has an implicit template to merge into.
  if (typeof obj.template === 'string') {
    const template = await getTemplate(obj.template);

    // Failed to get template matching obj.template from template.src!
    if (template instanceof Error) {
      obj.err ??= [];
      obj.err.push(template.message);
      return obj;
    } else {
      // Merge obj --> template
      // Template must be cloned to prevent cross polination and array aggregation.
      obj = merge(structuredClone(template), obj);
    }
  }

  // The object has a template object to merge into.
  if (obj.template instanceof Object) {
    const template = await getTemplate(obj.template);

    // Failed to get template matching obj.template from template.src!
    if (template instanceof Error) {
      obj.err ??= [];
      obj.err.push(template.message);
      return obj;
    } else {
      // Merge obj --> template
      // Template must be cloned to prevent cross polination and array aggregation.
      obj = merge(structuredClone(template), obj);
    }
  }

  // The _template can be a string or object [with src]
  for (const _template of obj.templates || []) {
    const template = await getTemplate(_template);

    // Failed to retrieve template matching template_key
    if (template instanceof Error) {
      obj.err ??= [];
      obj.err.push(template.message);
      return obj;
    } else {
      //The object key must not be overwritten by a template key.
      delete template.key;

      //The object template must not be overwritten by a templates template.
      delete template.template;

      // Merge template --> obj
      obj = merge(obj, template);
    }
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
@function assignWorkspaceTemplates

@description
The method parses an object for a template object property. The template property value will be assigned to the workspace.templates{} object matching the template key value.

The template._type property will be set to 'template' indicating that the templates origin is in the workspace. It is possible to overassign _type:'core' templates which are loaded from the /mod/workspace/templates directory.

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
