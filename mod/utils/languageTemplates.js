const getTemplate = require('../workspace/getTemplate')

const workspaceCache = require('../workspace/cache')

module.exports = async (req, params) => {

    const workspace = await workspaceCache()

    let template = workspace.templates[params.template]?.[params.language]

    console.log(template)

    template =  await getTemplate({
        src: workspace.templates[params.template]?.[params.language]
    })

    template = template.template.replace(/[{]{2}([A-Za-z][A-Za-z0-9]*)[}]{2}/g, matched => {

        // regex matches {{ or }}
        return params[matched.replace(/[{]{2}|[}]{2}/g, '')] || '';
      });

    return template
}
