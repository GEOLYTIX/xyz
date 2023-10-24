const getTemplate = require('../workspace/getTemplate')

module.exports = async (req, params) => {

    let template =  await getTemplate({
        src: req.params.workspace.templates[params.template]?.[params.language]
    })


    template = template.template.replace(/[{]{2}([A-Za-z][A-Za-z0-9]*)[}]{2}/g, matched => {

        // regex matches {{ or }}
        return params[matched.replace(/[{]{2}|[}]{2}/g, '')] || '';
      });

    return template
}
