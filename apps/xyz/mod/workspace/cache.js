/**
## /workspace/cache
The module exports the default checkWorkspaceCache method which returns the async cacheWorkspace method which resolves into a JSON workspace.

Default templates can be overwritten in the workspace or by providing a CUSTOM_TEMPLATES xyzEnvironment variable which references a JSON with templates to be merged into the workspace.

@requires /provider/getSrc
@requires /utils/merge
@requires /utils/processEnv

@module /workspace/cache
*/

import { clearSrcMap, getSrc } from '../provider/getSrc.js';
import logger from '../utils/logger.js';
import merge from '../utils/merge.js';

let timestamp = 0;
let workspacePromise = null;

/**
@function checkWorkspaceCache

@description
The async cacheWorkspace method is assigned to the module scope workspacePromise variable. The variable is re-assigned if the WORKSPACE_AGE xyzEnvironment variable is exceeded or the force param is true.

@param {boolean} [force] The workspace cache will be cleared with the force param flag.
@returns {Promise<workspace>} Resolves to the JSON workspace.
*/
export default function checkWorkspaceCache(force) {
  // A WORKSPACE_AGE of 0 invalidates the cache on every check.
  if (force || Date.now() - timestamp >= +xyzEnv.WORKSPACE_AGE) {
    workspacePromise = cacheWorkspace();
  }

  workspacePromise ??= cacheWorkspace();

  return workspacePromise;
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

The workspace is assigned to the module scope workspacePromise variable and the timestamp is recorded.

@returns {Promise<workspace>} Resolves to the JSON workspace.
*/
async function cacheWorkspace() {
  // The timestamp is recorded before the workspace is fetched to determine the cache age.
  timestamp = Date.now();

  const cache_timestamp = timestamp;

  clearSrcMap();

  // The workspace must be fetched fresh on cache invalidation.
  const workspace = await getSrc({ src: xyzEnv.WORKSPACE });

  if (workspace instanceof Error) {
    // The getSrc would not be retried otherwise.
    workspacePromise = null
    console.error(workspace);
    return {
      error: true,
      message: workspace.message,
      stack: workspace.stack,
    };
  }

  workspace.errors = new Set();

  const workspace_templates = structuredClone(workspace.templates);

  workspace.templates = Object.create(null);

  assign_workspace_templates(workspace.templates, view_templates);
  assign_workspace_templates(workspace.templates, mail_templates);
  assign_workspace_templates(workspace.templates, msg_templates);
  assign_workspace_templates(workspace.templates, query_templates);

  if (xyzEnv.CUSTOM_TEMPLATES) {
    const custom_templates = await getSrc({ src: xyzEnv.CUSTOM_TEMPLATES });
    if (custom_templates instanceof Error) {
      console.error(custom_templates);
      workspace.errors.add(`CUSTOM_TEMPLATES: ${custom_templates?.message}`);
    } else if (typeof custom_templates === 'object') {
      assign_workspace_templates(
        workspace.templates,
        custom_templates,
        'custom',
      );
    }
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

  workspace.timestamp = cache_timestamp;

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
