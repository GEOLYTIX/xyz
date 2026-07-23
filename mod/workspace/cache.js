/**
## /workspace/cache
The module exports the cacheWorkspace method which returns a workspace from the module scope cache variable or call the cacheWorkspace method to cache the workspace.

Default templates can be overwritten in the workspace or by providing a CUSTOM_TEMPLATES xyzEnvironment variable which references a JSON with templates to be merged into the workspace.

@requires /provider/getSrc
@requires /utils/merge
@requires /utils/processEnv

@module /workspace/cache
*/

import getSrc from '../provider/getSrc.js';
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

  // cacheWorkspace will set the current timestamp
  // and cache workspace outside export closure prior to returning workspace.
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

@description
The workspace is retrived from the source defined in the WORKSPACE xyzEnvironment variable.

Templates defined in the CUSTOM_TEMPLATES xyzEnvironment variable are spread into the default workspace.templates{}.

Each locale from the workspace.locale{} is merged into the workspace.locale{} template.

Locale objects get their key and name properties assigned if falsy.

The workspace is assigned to the module scope cache variable and the timestamp is recorded.

@returns {workspace} JSON Workspace.
*/
async function cacheWorkspace() {
  const hasProvider =
    xyzEnv.WORKSPACE && (await getSrc({ src: xyzEnv.WORKSPACE, test: true }));

  // The workspace must be fetched fresh on cache invalidation and bypasses the source map.
  const workspace = hasProvider
    ? await getSrc({ src: xyzEnv.WORKSPACE, cache: false })
    : {};

  if (workspace instanceof Error) {
    throw workspace;
  }

  const custom_templates =
    xyzEnv.CUSTOM_TEMPLATES &&
    (await getSrc({ src: xyzEnv.CUSTOM_TEMPLATES, cache: false }));

  /**
  @function mark_template

  @description
  The method maps the Object.entries of the templates_object param and assigns the _type property on the object marking is a different types of templates.


  @param {Object} templates_object
  @returns {Object} templates_object with _core: true property.
  */
  function mark_template(templates_object, type) {
    if (!templates_object) return;

    return Object.fromEntries(
      Object.entries(templates_object).map(([key, template]) => [
        key,
        { ...template, _type: type },
      ]),
    );
  }

  // Assign default view and query templates to workspace.
  workspace.templates = {
    ...mark_template(view_templates, 'core'),
    ...mark_template(mail_templates, 'core'),
    ...mark_template(msg_templates, 'core'),
    ...mark_template(query_templates, 'core'),

    ...mark_template(custom_templates, 'custom'),

    // Default templates can be overridden by assigning a template with the same key.
    ...mark_template(workspace.templates, 'workspace'),
  };

  // A workspace must have a default locale [template]
  workspace.locale ??= {
    layers: {},
  };

  // The default locale is assigned as locale in the locales object if the locales are not configured in the JSON workspace.
  workspace.locales ??= {
    locale: workspace.locale,
  };

  if (workspace.plugins) {
    console.warn(
      `Default plugins should be defined in the default workspace.locale{}`,
    );
  }

  workspace.key ??= xyzEnv.TITLE;

  logger(`Workspace cached;`, 'workspace');

  timestamp = Date.now();

  cache = workspace;

  // Cached source responses may be stale after the workspace is rebuilt.
  await getSrc({ clear: true });

  getSrc({ workspace: cache }).then((result) => {
    if (result instanceof Error) {
      // TODO needs test
      console.error(result);
    }
  });

  return workspace;
}
