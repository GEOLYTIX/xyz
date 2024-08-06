/**
@module /workspace/getTemplate
*/

const getFrom = require('../provider/getFrom')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

module.exports = async (template_key) => {

  const workspace = await workspaceCache()

  if (!Object.hasOwn(workspace.templates, template_key)) {
    return new Error('Template not found.')
  }

  let template = workspace.templates[template_key]

  if (!template.src) {

    return template
  }

  let response;

  if (template.cached) {

    return template.cached
  }

  // Subtitutes ${*} with process.env.SRC_* key values.
  template.src = template.src.replace(/\$\{(.*?)\}/g,
    matched => process.env[`SRC_${matched.replace(/(^\${)|(}$)/g, '')}`]);


  if (!Object.hasOwn(getFrom, template.src.split(':')[0])) {

    // Unable to determine getFrom method.
    console.warn(`Cannot get: "${template.src}"`);
    return template
  }

  response = await getFrom[template.src.split(':')[0]](template.src)

  if (response instanceof Error) {

    template.err = response

    return template
  }

  // Template is a module.
  if (template.module || template.type === 'module') {
    try {

      // Attempt to construct module from string.
      const module_constructor = module.constructor;
      const Module = new module_constructor();
      Module._compile(response, template.src);

      template.render = Module.exports

    } catch (err) {
      template.err = err
      return template
    }
  }

  if (typeof response === 'object') {

    // Get template from src.
    template.cached = merge(response, template)

    return template.cached

  } else if (typeof response === 'string') {

    template.template = response
  }

  return template
}
