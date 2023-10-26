const getFrom = require('../provider/getFrom')

const workspaceCache = require('../workspace/cache')

module.exports = async (key, lang = 'en') => {

    if (key === undefined) return;

    const workspace = await workspaceCache()

    if (!Object.hasOwn(workspace.templates, key)) {

        console.warn(`Template ${key} not found.`)
        return;
    }

    const allLanguages = workspace.templates[key]

    let template = Object.hasOwn(allLanguages, lang)? allLanguages[lang]: allLanguages.en;

    if (typeof template === 'string' && Object.hasOwn(getFrom, template.split(':')[0])) {

        // Get template from method.
        template = await getFrom[template.split(':')[0]](template)
    }

    return template
}
