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
@global
@typedef {Object} template A template is an object property of the workspace.templates
@property {Object} _type The _type property distinguish the origin of a template. 'core' templates are added from the /mod/workspace/templates directory. A 'custom' is added from a custom_template JSON file defined in the process.env. A 'workspace' is added from the workspace itself. A _type='template' object is assigned in the [assignWorkspaceTemplates]{@link module:/workspace/mergeTemplates~assignWorkspaceTemplates} method.
@property {String} src The source is a location from which a template object is loaded when required. Once loaded the template will be cached.
@property {Object} cached The cached template.
@property {String} template The string representation of a template, eg. html, sql.
@property {Function} render A method which resolves in a template string.
@property {Boolean} module The template is a module.
*/

/**
@function getTemplate
@async

@description
The workspace will checked and cached by the [Workspace API checkWorkspaceCache]{@link module:/workspace/cache~checkWorkspaceCache} method.

A template object matching the template_key param in the workspace.templates{} object will be returned from the getTemplate method.

The template will be retrieved from its src if not cached.

Module templates will be constructed before being returned.

@param {string} template 

@returns {Promise<Object|Error>} JSON Template
*/
module.exports = async function getTemplate(template, purge) {

  if (typeof template === 'string') {
    const workspace = await workspaceCache(purge)

    if (workspace instanceof Error) {
      return workspace
    }

    if (!Object.hasOwn(workspace.templates, template)) {
      return new Error(`Template: ${template} not found.`)
    }

    template = workspace.templates[template]

  }

  if (!template.src) {

    return template
  }

  if (template.cached) {
    return structuredClone(template.cached)
  }

  // Subtitutes ${*} with process.env.SRC_* key values.
  template.src = envReplace(template.src);

  const method = template.src.split(':')[0]

  if (!Object.hasOwn(getFrom, method)) {

    // Unable to determine getFrom method.
    console.warn(`Cannot get: "${template.src}"`);
    return template
  }

  const response = await getFrom[method](template.src)

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
