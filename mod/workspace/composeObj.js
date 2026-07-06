/**
## /workspace/composeObj

@module /workspace/composeObj
*/

import merge from '../utils/merge.js';
import * as Roles from '../utils/roles.js';
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

  obj = await mergeTemplateIntoObj(obj, obj.template, roles, true);

  // This would only happen if the user does not have access to the object after it has been merged into the template [prototype].
  if (obj instanceof Error) return obj;

  // //If the user is an admin we don't need to check roles
  // if (!Roles.check(obj, roles)) {
  //   return new Error('Role access denied.');
  // }

  return obj;
}

/**
@function mergeTemplateIntoObj
@async

@description

@param {Object} obj
@param {Object} [template] The template maybe an object with a src property or a string.
@param {array} [roles] An array of user roles from request params.
@param {boolean} [reverse] Whether the template should be merged into the obj or the obj into the template.
@param {string} [templateScope] The templateScope is a string that represents the path to the template in the workspace.templates object. It is used to prevent circular references when merging templates.

@returns {Promise<Object>} Returns the merged obj.
*/
async function mergeTemplateIntoObj(obj, template, roles, reverse, templateScope) {
  if (template === undefined) {
    await parseTemplates(obj, roles, obj.key);
    return obj;
  };

  template = await getTemplate(template);

  // Failed to get template matching obj.template from template.src!
  if (template instanceof Error) {
    obj.err ??= [];
    obj.err.push(template.message);
    return obj;
  }

  template = filterProperties(obj, template);

  if (reverse) {
    delete obj.template;
    // Merge obj --> template
    obj = merge(template, obj);
    await parseTemplates(obj, roles, templateScope);
    return obj;
  }

  templateScope = `${templateScope}/${template.key}`;

  await parseTemplates(template, roles, templateScope);

  // The scopes array will be merged into the obj.scopes array.
  template.scopes = [templateScope];

  // Merge template --> obj
  obj = merge(obj, template);
  return obj;
}

/**
@function filterProperties

@description
The filterProperties method will check for include_props and exclude_props properties on the obj and template.

@param {Object} obj The parent object providing include/exclude property configuration.
@param {Object} template The template to prepare.

@returns {Object} The prepared template with role overrides applied and properties filtered.
*/
function filterProperties(obj, template) {

  // TODO: should the props carried into nested templates? undefined include_props/exclude_props should not be assigned to the template object.
  template.exclude_props = obj.exclude_props ?? template.exclude_props;
  template.include_props = obj.include_props ?? template.include_props;

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

/**
@function parseTemplates

@description
The parseTemplates method will recursively traverse the provided object and its nested objects to identify and process template definitions.

If a template object is found, it will be added to the workspace.templates object for later use. The template property will be removed from the object after processing.

If an array of templates is found, each template will be merged into the object in the order they are defined in the array.

@param {Object} obj
@param {Object} roles
@param {string} templateScope
*/
async function parseTemplates(obj, roles, templateScope) {
  // Return early if object is null or empty
  if (obj === null) return;

  if (obj instanceof Object && !Object.keys(obj)) return;

  for (const [key, val] of Object.entries(obj)) {

    if (queryTemplate(key, val, obj, roles, templateScope)) continue;

    if (await templatesArray(key, val, obj, roles, templateScope)) continue;

    // Recursively process each item if we find an array
    if (Array.isArray(val)) {
      for (const item of val) {
        await parseTemplates(item, roles, templateScope);
      }
      continue;
    }

    // Recursively process nested objects
    if (val instanceof Object) {
      await parseTemplates(val, roles, templateScope);
    }
  }
}

/**
@function queryTemplate

@description
The method checks if the key is 'template' and the val has a key property. If so, it will add the template to the workspace.templates object and remove the template property from the obj.

@param {string} key
@param {Object} val
@param {Object} obj
@param {array} roles
@param {string} templateScope
@returns {boolean} Returns true if the key is 'template' and the val has a key property.
*/
function queryTemplate(key, val, obj, roles, templateScope) {

  if (key !== 'template') return false;

  if (!val.key) return false;

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
@param {string} templateScope
@returns {boolean} Returns true if the key is 'templates' and the val is an array.
*/
async function templatesArray(key, val, obj, roles, templateScope) {
  if (key !== 'templates') return false;

  if (!Array.isArray(val)) return false;

  // Delete the templates property from the obj before merging the templates into the obj. This will prevent circular references when merging templates.
  delete obj.templates;

  for (const template of val) {
    // Merge template from templates array into the object. The templates will be merged in the order they are defined in the array.
    await mergeTemplateIntoObj(obj, template, roles, false, templateScope);
  }
  
  return true;
}
