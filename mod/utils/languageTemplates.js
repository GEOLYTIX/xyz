/**
@requires /provider/getFrom
@requires /workspace/getTemplate
@module /utils/languageTemplates
*/

const getFrom = require('../provider/getFrom')

const getTemplate = require('../workspace/getTemplate')

/**
@function languageTemplates
@async

@description
The method will request a template from the `getTemplate()` module method.

An error will be logged but not returned. The template key string will be returned instead. This is to prevent a missing message template from returning an error but returning the message key instead.

A warning will be issues if a non language template is requested from this method. Non language templates have a src property which resolves into the template.template property which will be returned.

Language templates must have an `en` property. The english template will be returned if the requested language is not featured in the languageTemplate{} object.

HTML view templates must be returned as a srting value. The HTML string is usually requested from a ressource which will be parsed by the `getFrom()` method if the languageTemplate string begins with a getFrom method, eg. 'https:'

@param {Object} params Params object which specifies the template.
@property {string} params.template The key of the template.
@property {string} [params.language = 'en'] The template language
*/
module.exports = async function languageTemplates(params) {

  if (params.template === undefined) return;

  const languageTemplate = await getTemplate(params.template)

  if (languageTemplate instanceof Error) {

    // Return the template string value if the template is not available in workspace.
    return params.template
  }

  // NOT a language template
  if (languageTemplate.src) {

    console.warn(`Non language template [${params.template}] requested from languageTemplates module.`)
    return languageTemplate.template
  }

  // Set english as default template language.
  params.language ??= 'en'

  // Assign language property from languageTemplate as template
  const template = Object.hasOwn(languageTemplate, params.language)
    ? languageTemplate[params.language]
    : languageTemplate.en;

  // HTML Templates must be gotten as string from [template] string.
  if (typeof template === 'string' && Object.hasOwn(getFrom, template.split(':')[0])) {

    // Get template from method.
    return await getFrom[template.split(':')[0]](template)
  }

  return template
}
