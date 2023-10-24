const getFrom = require('../provider/getFrom')

const merge = require('../utils/merge')

module.exports = async (template) => {

  if (!template.src) {

    return template
  }

  if (template.loaded) {

    return template
  }

  // Substitute parameter in src string.
  template.src = template.src.replace(/\$\{(.*?)\}/g,
    (matched) => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched);


  if (!Object.hasOwn(getFrom, template.src.split(':')[0])) {

    // Unable to determine getFrom method.
    console.warn(`Cannot get: "${template.src}"`);
    return template
  }

  const response = await getFrom[template.src.split(':')[0]](template.src)

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
    merge(template, response)

  } else if (typeof response === 'string') {

    template.template = response
  }

  template.loaded = true

  return template
}