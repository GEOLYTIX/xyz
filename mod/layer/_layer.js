const formats = {
  mvt: require('./mvt')
}

const workspaceCache = require('../workspace/cache')

module.exports = async (req, res) => {

  const workspace = await workspaceCache()

  if (!req.params.layer) {
    return res.send(`Failed to evaluate 'layer' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/layer/">Layer API</a>`)
  }

  // The format key must be an own property of the formats object.
  if (!Object.hasOwn(formats, req.params.format)) {
    return res.send(`Failed to evaluate 'format' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/layer/">Layer API</a>`)
  }

  if (req.params.locale) {
    
    // The locale key must be an own property of the workspace.locales, and must be an object.
    if (Object.hasOwn(workspace.locales, req.params.locale)
      && typeof workspace.locales[req.params.locale] === 'object') {

        // Assign layer from locale in workspace.
        req.params.layer = workspace.locales[req.params.locale].layers[req.params.layer]

    } else {

      // Terminate request if locale is defined but not valid.
      return res.send(`Failed to evaluate locale param.`)
    }

  // A layer must be specified in the templates without a locale specifier, and must be an object
  } else if (Object.hasOwn(workspace.templates, req.params.layer)
    && typeof workspace.templates[req.params.layer] === 'object') {

    // Assign layer object from templates.
    req.params.layer = workspace.templates[req.params.layer]

  } else {

    return res.send(`Failed to evaluate layer param.`)
  }
    
  return formats[req.params.format](req, res)
}