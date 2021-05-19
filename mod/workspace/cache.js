const file = require('./file');

const http = require('./http');

const cloudfront = require('../provider/cloudfront');

const github = require('../provider/github');

const getFrom = {
  http: (ref) => http(ref),
  https: (ref) => http(ref),
  file: (ref) => file(`../../public/workspaces/${ref.split(':')[1]}`),
  cloudfront: (ref) => cloudfront(ref.split(':')[1]),
  github: (ref) => github(ref.split(':')[1]),
};

const assignTemplates = require('./assignTemplates');

const defaults = require('./defaults');

const assignDefaults = require('./assignDefaults');

let workspace = null;

const logger = require('../logger');

<<<<<<< HEAD
module.exports = async () => {

  let timestamp = Date.now()
=======
module.exports = async (req) => {
  let timestamp = Date.now();
>>>>>>> AM-1: Created endpoint to get dynamic workspace

  // If the workspace is empty or older than 1hr it needs to be cached.
  if (
    !workspace ||
    timestamp - workspace.timestamp > 3600000 ||
    process.env.WORKSPACE === 'dynamic'
  ) {
    if (!workspace) {
      logger(`workspace is empty ${timestamp}`);
    } else if (timestamp - workspace.timestamp > 3600000) {
      logger(
        `workspace has expired ${workspace.timestamp} | new timestamp is ${timestamp}`
      );
    }

    if (process.env.WORKSPACE === 'dynamic') {
      const url = process.env.WORKSPACE_ENDPOINT.replace(
        '{project}',
        req.query.project
      ).replace('{slug}', req.query.slug);
      workspace = await getFrom[url.split(':')[0]](url);
      workspace = JSON.parse(workspace);
    } else {
      workspace =
        (process.env.WORKSPACE &&
          (await getFrom[process.env.WORKSPACE.split(':')[0]](
            process.env.WORKSPACE
          ))) ||
        {};
    }
    if (workspace instanceof Error) return workspace;

    // Return the default locale
    if (!workspace.locales) {
      workspace = {
        locales: {
          zero: defaults.locale,
        },
      };
      return workspace;
    }

    await assignTemplates(workspace);

    await assignDefaults(workspace);

    // Substitute SRC_* variables in locales.
    workspace.locales = JSON.parse(
      JSON.stringify(workspace.locales).replace(
        /\$\{(.*?)\}/g,
        (matched) =>
          process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched
      )
    );

    workspace.timestamp = timestamp;
  } else {
    logger(
      `workspace cached ${workspace.timestamp} | age ${
        timestamp - workspace.timestamp
      }`
    );
  }

  return workspace;
};
