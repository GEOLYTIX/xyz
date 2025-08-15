/**
## /workspace/getTemplate
The module exports the getTemplate method which is required by the query, languageTemplates, getLayer, and getLocale modules.

@requires /provider/getFrom
@requires /workspace/cache
@requires module:/utils/processEnv

@module /workspace/getTemplate
*/

import getFrom from '../provider/getFrom.js';
import envReplace from '../utils/envReplace.js';
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

A JSON template object will be requested from the getTemplateObject method.

An error will be returned if the lookup failed.

A template will be fetched from the templates src property.

A template can be cached by removing the src property in the workspace.templates.

The key will be assigned to the template object as key property.

@param {string} key

@returns {Promise<Object|Error>} JSON Template
*/
export default async function getTemplate(key) {
  if (key === undefined) {
    return new Error('Undefined template key.');
  }
  const workspace = await workspaceCache();

  if (workspace instanceof Error) {
    return workspace;
  }

  let template;
  if (typeof key === 'string') {
    template = await getTemplateObject(workspace, key);
  } else if (key instanceof Object) {
    template = key;
  }

  if (template instanceof Error) {
    return template;
  }

  if (!template.src) {
    return template;
  }

  if (!template.key) {
    template =
      (await getTemplateObject(workspace, null, template.src)) || template;
  }

  let response;

  if (template.src) {
    // Subtitutes ${*} with xyzEnv.SRC_* key values.
    template.src = envReplace(template.src);

    const method = template.src.split(':')[0];

    if (!Object.hasOwn(getFrom, method)) {
      // Unable to determine getFrom method.
      const err = new Error(`Cannot get: "${template.src}"`);
      console.error(err);
      return err;
    }

    response = await getFrom[method](template.src);

    if (response instanceof Error) {
      template.err = response;
      return response;
    }
  }

  // Template is a module.
  if (template.module) {
    template = await moduleTemplate(template, response);
    return template;
  }

  if (typeof response === 'object') {
    template = await cacheTemplate(workspace, template, response);
    return template;
  } else if (typeof response === 'string') {
    template.template = response;
  }

  return template;
}

/**
@function getTemplateObject
@async

@description
A template object matching the template_key param in the workspace.templates{} object will be returned.

The template string will be checked to include only whitelisted characters.

An error exception will be returned if the template object lookup from the workspace failed.

@param {string} template

@returns {Promise<Object|Error>} JSON Template
*/
async function getTemplateObject(workspace, templateKey, srcKey) {
  // The template param must not include non whitelisted character.
  if (templateKey && /[^a-zA-Z0-9 :_-]/.exec(templateKey)) {
    return new Error('Template param may only include whitelisted character.');
  }

  if (srcKey && Object.hasOwn(workspace.templates, srcKey)) {
    return workspace.templates[srcKey];
  }

  if (!templateKey) return;

  if (!Object.hasOwn(workspace.templates, templateKey)) {
    return new Error(`Template: ${templateKey} not found.`);
  }

  workspace.templates[templateKey].key = templateKey;

  return workspace.templates[templateKey];
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

/**
@function cacheTemplate
@async

@description
The method assigns the response object to the template object and removes the src property.

This effectively caches the template since the src to fetch the template is removed.

A src property is assigned as key for an object without an key property.

This allows to cache templates which should be merged into their respective parent objects.

A src property beginning with `file:` is not removed since file resources do not require caching.

@param {workspace} workspace
@param {object} template
@param {object} [response] An object from a template src

@returns {Promise<Object|Error>} JSON Template
*/
async function cacheTemplate(workspace, template, response = {}) {
  Object.assign(template, response);

  if (template.src) {
    workspace.templates[template.key || template.src] = template;

    // file src templates should not be cached.
    if (!template.src.startsWith('file:')) {
      delete template.src;
    }
  }

  return structuredClone(template);
}
