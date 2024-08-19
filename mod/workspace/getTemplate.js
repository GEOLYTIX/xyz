/**
## /workspace/getTemplate
The module exports the getTemplate method which is required by the query, languageTemplates, getLayer, and getLocale modules.

@requires /provider/getFrom
@requires /utils/merge
@requires /workspace/cache

@module /workspace/getTemplate
*/

const getFrom = require('../provider/getFrom')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

const envReplace = require('../utils/envReplace')

/**
@function getTemplate
@async

@description
The workspace will be requested from the workspace/cache module.

A template object matching the template_key param in the workspace.templates{} object will be returned from the getTemplate method.

The template will be retrieved from its src if not cached.

Module templates will be constructed before being returned.

@param {string} template 

@returns {Promise<Object|Error>} JSON Template
*/
module.exports = async function getTemplate(template) {

  if (typeof template === 'string') {
    const workspace = await workspaceCache()

    if (workspace instanceof Error) {
      return workspace
    }

    if (!Object.hasOwn(workspace.templates, template)) {
      return new Error('Template not found.')
    }

    template = workspace.templates[template]

  }

  if (!template.src) {

    return template
  }

  let response;

  if (template.cached) {
    return structuredClone(template.cached)
  }

  // Subtitutes ${*} with process.env.SRC_* key values.
  template.src = envReplace(template.src);

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
    return template;
  }

  if (typeof response === 'object') {

    // Get template from src.
    template.cached = merge(response, template)

    return structuredClone(template.cached)

  } else if (typeof response === 'string') {

    template.template = response
  }

  return template
}
