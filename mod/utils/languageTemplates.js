/**
@module /utils/languageTemplates
*/

const getFrom = require('../provider/getFrom')

const getTemplate = require('../workspace/getTemplate')

module.exports = async (params) => {

  if (params.template === undefined) return;

  // Set english as default template language.
  params.language ??= 'en'

  const languageTemplate = await getTemplate(params.template)

  if (languageTemplate instanceof Error) {

    // Return the template string value if the template is not available in workspace.
    return params.template
  }

  // NOT a language template
  if (languageTemplate.src) {

    return languageTemplate.template
  }

  let template = Object.hasOwn(languageTemplate, params.language)
    ? languageTemplate[params.language]
    : languageTemplate.en;

  // HTML Templates must be gotten as string from [template] string.
  if (typeof template === 'string' && Object.hasOwn(getFrom, template.split(':')[0])) {

    // Get template from method.
    
    template = await getFrom[template.split(':')[0]](template)
  }

  return template
}
