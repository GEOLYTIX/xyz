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

    console.log(template)

    if (typeof template === 'string' && Object.hasOwn(getFrom, template.split(':')[0])) {

        // Get template from method.
        template = await getFrom[template.split(':')[0]](template)

    } else if (typeof template === 'object' && (Object.hasOwn(template, 'text') || Object.hasOwn(template, 'html'))) {

        if (Object.hasOwn(getFrom, template.text?.split(':')[0])) {

            template.text = await getFrom[template.text.split(':')[0]](template.text)
        }

        if (Object.hasOwn(getFrom, template.html?.split(':')[0])) {

            template.html = await getFrom[template.html.split(':')[0]](template.html)
        }

    }

    // // Prevent prototype polluting assignment.
    // Object.freeze(Object.getPrototypeOf(template));

    // for (key in template) {

    //     // Prevent prototype polluting assignment.
    //     if (/__proto__/.test(key)) continue;

    //     // Template key / value is a string with a valid get method.
    //     if (typeof template[key] === 'string'
    //         && Object.hasOwn(template, key)
    //         && Object.hasOwn(getFrom, template[key].split(':')[0])) {

    //         // Assign template key value from method.
    //         template[key] = await getFrom[template[key].split(':')[0]](template[key])
    //     }

    //     // Template key value is still string after assignment
    //     if (typeof template[key] === 'string') {

    //         // Look for template params to be substituted.
    //         template[key] = template[key].replace(/\$\{{1}(.*?)\}{1}/g,

    //             // Replace matched params in string values
    //             matched => params[matched.replace(/\$\{{1}|\}{1}/g, '')] || '')
    //     }

    // }

    return template
}
