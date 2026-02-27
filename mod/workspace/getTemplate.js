/**
## /workspace/getTemplate
The module exports the getTemplate method which is required by the query, languageTemplates, getLayer, and getLocale modules.

@requires /provider/getFrom
@requires /workspace/cache

@module /workspace/getTemplate
*/

import getFrom from '../provider/getFrom.js';
import workspaceCache from './cache.js';

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
The workspace will be checked and cached by the [Workspace API checkWorkspaceCache]{@link module:/workspace/cache~checkWorkspaceCache} method.

The template parameter provided as a string from user input must be validated to only include whitelisted character.

A lookup for the template object in the cached workspace.templates{} will be performed.

The template will be returned without a src property.

Otherwise a lookup will be performed to check whether a template with a src property has been cached with the src as key in the workspace.templates{}.

An error will be returned if the getFrom method is unknown or unable to fetch from the template.src

A module template will be created from the response with the template.module flag.

In order to cache templates the fetched response object will be assigned to the template object in the workspace.templates.

The src property will be removed unless from a file origin where access is immediate.

A structured clone of the template will be returned to prevent the cached object being modified by role merges.

@param {string|object} template to be retrieved from workspace.templates if provided as string

@returns {Promise<Object|Error>} JSON Template
*/
export default async function getTemplate(template) {
  if (template === undefined) {
    return new Error('Undefined template key.');
  }

  const workspace = await workspaceCache();

  if (workspace instanceof Error) {
    return workspace;
  }

  if (typeof template === 'string') {
    // Protect from user provided input.
    if (/[^a-zA-Z0-9 :_-]/.exec(template)) {
      return new Error('Template key may only include whitelisted character.');
    }

    if (!Object.hasOwn(workspace.templates, template)) {
      return new Error(`Template: ${template} not found.`);
    }

    template = workspace.templates[template];
  }

  if (!template.src) {
    return template;
  }

  // Check whether a template from .src has been cached.
  if (Object.hasOwn(workspace.templates, template.src)) {
    return workspace.templates[template.src];
  }

  const method = template.src.split(':')[0];

  if (!Object.hasOwn(getFrom, method)) {
    // Unable to determine getFrom method.
    return new Error(`Unknown getFrom method: ${template.src}`);
  }

  const response = await getFrom[method](template.src);

  if (response instanceof Error) {
    return new Error(`Unable to getFrom src: ${template.src}`);
  }

  if (template.module) {
    template = await moduleTemplate(template, response);
    // Module templates must not be cached.
    return template;
  }

  if (typeof response === 'object') {
    Object.assign(template, response);

    workspace.templates[template.key || template.src] = template;

    // file src templates should not be cached.
    if (!template.src.startsWith('file:')) {
      delete template.src;
    }

    return structuredClone(template);
  }

  // TODO test string template
  if (typeof response === 'string') {
    template.template = response;
  }

  return template;
}

/**
@function moduleTemplate
@async

@description
The script string is converted to a JavaScript data URL which can be used in a dynamic ESM import.

The default export or the imported module itself will be assigned as the render method in the module template.

Module templates are not cached.
@param {object} template
@param {string} response Module script as string.

@returns {Promise<Object|Error>} JSON Template
*/
async function moduleTemplate(template, response) {
  try {
    const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(response)}`;

    // Use dynamic import to load the module
    const importedModule = await import(dataUrl);

    // Set the render function to the default export or the entire module
    template.render = importedModule.default || importedModule;
  } catch (err) {
    return err;
  }
  return template;
}
