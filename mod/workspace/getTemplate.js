/**
## /workspace/getTemplate
The module exports the getTemplate method which is required by the query, languageTemplates, getLayer, and getLocale modules.

@requires /provider/getFrom
@requires /utils/merge
@requires /workspace/cache
@requires module:/utils/processEnv

@module /workspace/getTemplate
*/

import getFrom from '../provider/getFrom.js';

import merge from '../utils/merge.js';

import workspaceCache from './cache.js';

import envReplace from '../utils/envReplace.js';

/**
@global
@typedef {Object} template A template is an object property of the workspace.templates
@property {Object} _type The _type property distinguish the origin of a template. 'core' templates are added from the /mod/workspace/templates directory. A 'custom' is added from a custom_template JSON file defined in the xyzEnv. A 'workspace' is added from the workspace itself. A _type='template' object is assigned in the [assignWorkspaceTemplates]{@link module:/workspace/mergeTemplates~assignWorkspaceTemplates} method.
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
A JSON template object will be requested from the getTemplateObject method.

An error will be returned if the lookup failed.

A template will be requested from source if the template has not been cached.

Template modules will be constructed.

@param {string} template

@returns {Promise<Object|Error>} JSON Template
*/
export default async function getTemplate(template) {
  template = await getTemplateObject(template);

  if (template instanceof Error) {
    return template;
  }

  if (!template.src) {
    return template;
  }

  if (template.cached) {
    return structuredClone(template.cached);
  }

  // Subtitutes ${*} with xyzEnv.SRC_* key values.
  template.src = envReplace(template.src);

  const method = template.src.split(':')[0];

  if (!Object.hasOwn(getFrom, method)) {
    // Unable to determine getFrom method.
    console.warn(`Cannot get: "${template.src}"`);
    return template;
  }

  const response = await getFrom[method](template.src);

  if (response instanceof Error) {
    template.err = response;

    return template;
  }

  // Template is a module.
  if (template.module) {
    try {
      // For ESM modules, we need to use dynamic import with a data URL
      // Convert the module code to a data URL with the proper MIME type
      const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(response)}`;

      // Use dynamic import to load the module
      const importedModule = await import(dataUrl);

      // Set the render function to the default export or the entire module
      template.render = importedModule.default || importedModule;
    } catch (err) {
      console.error(err);
      template.err = err;
      return template;
    }
    return template;
  }

  if (typeof response === 'object') {
    // Get template from src.
    template.cached = merge(response, template);

    return structuredClone(template.cached);
  } else if (typeof response === 'string') {
    template.template = response;
  }

  return template;
}

/**
@function getTemplateObject
@async

@description
The workspace will checked and cached by the [Workspace API checkWorkspaceCache]{@link module:/workspace/cache~checkWorkspaceCache} method.

A template object matching the template_key param in the workspace.templates{} object will be returned.

The template string will be checked to include only whitelisted character.

An error exception will be returned if the template object lookup from the workspace failed.

@param {string} template

@returns {Promise<Object|Error>} JSON Template
*/
async function getTemplateObject(template) {
  if (typeof template === 'string') {
    // The template param must not include non whitelisted character.
    if (/[^a-zA-Z0-9 :_-]/.exec(template)) {
      return new Error(
        `Template param may only include whitelisted character.`,
      );
    }

    const workspace = await workspaceCache();

    if (workspace instanceof Error) {
      return workspace;
    }

    if (!Object.hasOwn(workspace.templates, template)) {
      return new Error(`Template: ${template} not found.`);
    }

    template = workspace.templates[template];
  }

  return template;
}
