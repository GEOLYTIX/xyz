const getFrom = require('../provider/getFrom')

const workspaceCache = require('../workspace/cache')

module.exports = async (params) => {

    if (params.template === undefined) return;

    // Set english as default template language.
    params.language ??= 'en'

    const workspace = await workspaceCache()

    if (!Object.hasOwn(workspace.templates, params.template)) {

        console.warn(`Template ${params.template} not found.`)
        return params.template;
    }

    const allLanguages = workspace.templates[params.template]

    let template = Object.hasOwn(allLanguages, params.language)? allLanguages[params.language]: allLanguages.en;

    if (typeof template === 'string' && Object.hasOwn(getFrom, template.split(':')[0])) {

        // Get template from method.
        template = await getFrom[template.split(':')[0]](template)
    }

    return template
}
