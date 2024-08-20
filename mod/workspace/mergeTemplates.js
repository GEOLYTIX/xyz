const merge = require('../utils/merge')

const envReplace = require('../utils/envReplace')

const getTemplate = require('./getTemplate')

module.exports = async function mergeTemplates(obj) {

  const template = await getTemplate(obj.template || obj.key)

  // Failed to get template matching obj.template from template.src!
  if (template.err instanceof Error) {

    obj.err ??= []
    obj.err.push(template.err.message)

  // The template is not in the workspace.templates{}
  } else if (template instanceof Error) {

    // Only log error if obj.template is implicit.
    // It is not presumed that a obj.key has a matching template.
    if (obj.template) {
      obj.err ??= []
      obj.err.push(template.message)
    }

  } else {

    // Merge obj --> template
    obj = merge(template, obj)
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
