/**
## /workspace/cache
The module exports the cacheWorkspace method which returns a workspace from the module scope cache variable or call the cacheWorkspace method to cache the workspace.

Default templates can be overwritten in the workspace or by providing a CUSTOM_TEMPLATES xyzEnvironment variable which references a JSON with templates to be merged into the workspace.

@requires /provider/getSrc
@requires /utils/merge
@requires /utils/processEnv

@module /workspace/cache
*/

import { clearSrcMap, getSrc } from '../provider/getSrc.js';
import logger from '../utils/logger.js';
import merge from '../utils/merge.js';

let cache = null;
let timestamp = Infinity;

/**
@function checkWorkspaceCache

@description
The method checks whether the module scope variable cache has been populated.

The timestamp set by cacheWorkspace is checked against the current time. The [workspace] cache will be invalidated if the difference exceeds the WORKSPACE_AGE xyzEnvironment variable.

Setting the WORKSPACE_AGE to 0 is not recommended because the source promise map is flushed whenever the workspace is rebuilt. Constantly replacing the workspace prevents source responses from being reused between requests.

The cacheWorkspace method is called if the cache is invalid.

@param {boolean} [force] The workspace cache will be cleared with the force param flag.
@returns {workspace} JSON Workspace.
*/
export default function checkWorkspaceCache(force) {
  if (force) {
    // Reset the cache with force flag.
    cache = null;
  }

  // cache is null on first request for workspace.
  // cacheWorkspace is async and must be awaited.
  if (!cache) return cacheWorkspace();

  // cacheWorkspace will set the current timestamp and cache workspace outside export closure prior to returning workspace.
  // TODO write test with WORKSPACE_AGE 0
  if (Date.now() - timestamp > +xyzEnv.WORKSPACE_AGE) {
    // current time minus cached timestamp exceeds WORKSPACE_AGE
    cache = null;

    return cacheWorkspace();
  }

  return cache;
}

import mail_templates from './templates/_mails.js';
import msg_templates from './templates/_msgs.js';
import query_templates from './templates/_queries.js';
import view_templates from './templates/_views.js';

/**
@function cacheWorkspace
@async

@description
The workspace is retrived from the source defined in the WORKSPACE xyzEnvironment variable.

Templates defined in the CUSTOM_TEMPLATES xyzEnvironment variable are spread into the default workspace.templates{}.

Each locale from the workspace.locale{} is merged into the workspace.locale{} template.

Locale objects get their key and name properties assigned if falsy.

The workspace is assigned to the module scope cache variable and the timestamp is recorded.

@returns {workspace} JSON Workspace.
*/
async function cacheWorkspace() {
  clearSrcMap();

  // The workspace must be fetched fresh on cache invalidation.
  const workspace = await getSrc({ src: xyzEnv.WORKSPACE });

  if (workspace instanceof Error) {
    throw workspace;
  }

  const workspace_templates = structuredClone(workspace.templates);

  workspace.templates = Object.create(null);

  assign_workspace_templates(workspace.templates, view_templates);
  assign_workspace_templates(workspace.templates, mail_templates);
  assign_workspace_templates(workspace.templates, msg_templates);
  assign_workspace_templates(workspace.templates, query_templates);

  // TODO test CUSTOM_TEMPLATES
  if (xyzEnv.CUSTOM_TEMPLATES) {
    const custom_templates = await getSrc({ src: xyzEnv.CUSTOM_TEMPLATES });
    assign_workspace_templates(workspace.templates, custom_templates, 'custom');
  }

  assign_workspace_templates(
    workspace.templates,
    workspace_templates,
    'workspace',
  );

  // A workspace must have a default locale [template]
  workspace.locale ??= {
    layers: {},
  };

  // The default locale is assigned as locale in the locales object if the locales are not configured in the JSON workspace.
  workspace.locales ??= {
    locale: workspace.locale,
  };

  workspace.key ??= xyzEnv.TITLE;

  workspace.scopes = new Set();

  logger(`Workspace cached;`, 'workspace');

  timestamp = Date.now();

  cache = workspace;

  return workspace;
}

/**
@function assign_workspace_templates

@description
The method assigns objects in a templates object to the workspace.templates provided as workspace_templates param.

@param {object} workspace_templates The workspace.templates object.
@param {Object} templates_object An object of templates to be assigned with the template key to the workspace templates.
@param {string} [type = 'core'] The type value to assign to the template to identify the origin.
@returns {Object} templates_object with _core: true property.
*/
function assign_workspace_templates(
  workspace_templates,
  templates_object,
  type = 'core',
) {
  if (!templates_object) return;

  for (const [key, template] of Object.entries(templates_object)) {
    template._type = type;
    workspace_templates[key] = template;
  }
}
