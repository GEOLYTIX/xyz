/**
## /workspace/mergeTemplates

The workspace is cached in the module scope to allow for the mergeObjectTemplates(layer) method to assign template objects defined in a JSON layer to the workspace.templates{}.

@requires /utils/merge
@requires /utils/envReplace
@requires /workspace/getTemplate
@requires /workspace/cache

@module /workspace/mergeTemplates
*/

const merge = require('../utils/merge')

const envReplace = require('../utils/envReplace')

const getTemplate = require('./getTemplate')

const workspaceCache = require('./cache')

let workspace

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
module.exports = async function mergeTemplates(obj) {

  // Cache workspace in module scope for template assignment.
  workspace = await workspaceCache()

  // The object has an implicit template to merge into.
  if (obj.template) {

    const template = await getTemplate(obj.template)

    // Failed to get template matching obj.template from template.src!
    if (template.err instanceof Error) {

      obj.err ??= []
      obj.err.push(template.err.message)

      // The template is not in the workspace.templates{}
    } else if (template instanceof Error) {

      obj.err ??= []
      obj.err.push(template.message)

    } else {

      // Merge obj --> template
      // Template must be cloned to prevent cross polination and array aggregation.
      obj = merge(structuredClone(template), obj)
    }

    // Check whether the object key exist as template if no implicit template has been defined.
  } else if (Object.hasOwn(workspace.templates, obj.key)) {

    obj.err ??= []
    obj.err.push(`Template matching ${obj.key} exists in workspace.`)
  }

  for (const template_key of obj.templates || []) {

    const template = await getTemplate(template_key)

    // Failed to retrieve template matching template_key
    if (template.err instanceof Error) {

      obj.err ??= []
      obj.err.push(template.err.message)

      // A template matching the template_key does not exist.
    } else if (template instanceof Error) {

      obj.err ??= []
      obj.err.push(`${template_key}: ${template.message}`)
    } else {

      //The object key must not be overwritten by a template key.
      delete template.key;
      //The object template must not be overwritten by a templates template.
      delete template.template;
      // Merge template --> obj
      obj = merge(obj, template)
    }
  }

  // Substitute ${SRC_*} in object string.
  obj = envReplace(obj)

  // Assign templates to workspace.
  assignWorkspaceTemplates(obj)

  return obj
}

/**
@function assignWorkspaceTemplates

@description
The method parses an object for a template object property. The template property value will be assigned to the workspace.templates{} object matching the template key value.

The method will call itself for nested objects.

@param {Object} obj 
*/
function assignWorkspaceTemplates(obj) {

  if (obj === null) return;

  if (obj instanceof Object && !Object.keys(obj)) return;

  Object.entries(obj).forEach(entry => {

    if (entry[0] === 'template' && entry[1].key) {

      entry[1]._type = 'workspace_template';
      workspace.templates[entry[1].key] = Object.assign(workspace.templates[entry[1].key] || {}, entry[1])

      return;
    }

    if (Array.isArray(entry[1])) {

      entry[1].forEach(assignWorkspaceTemplates)
      return;
    }

    if (entry[1] instanceof Object) {

      Object.values(entry[1])?.forEach(assignWorkspaceTemplates)
    }

  })
}
