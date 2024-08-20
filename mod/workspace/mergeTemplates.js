const merge = require('../utils/merge')

const getTemplate = require('./getTemplate')

module.exports = async function mergeTemplates(obj) {

  const template = await getTemplate(obj.template || obj.key)

  // Failed to get template matching obj.template from template.src!
  if (template.err instanceof Error) {

    obj.err ??= []
    obj.err.push(template.err.message)

    // A template matching the layer key may not exist.
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
}
