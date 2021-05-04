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

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL;
const mongoClient = new MongoClient(uri);
mongoClient.connect();

module.exports = async (req) => {
  let timestamp = Date.now();

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
      if (!req) return
      const Page = mongoClient.db('acorn').collection('pages');
      const Version = mongoClient.db('acorn').collection('versions');
      const proposalPage = await Page.findOne({
        slug: req.query.slug,
        type: 'map',
        projectId: req.query.project,
        active: true,
      });
      console.log(req.query.slug);
      if (!proposalPage) return;
      // get the most recent version id
      const contentVersionId = proposalPage?.content[lang][0];
      if (!contentVersionId) return;
      const proposalContent = await Version.findById(contentVersionId);

      workspace = JSON.parse(proposalContent.geolytixWorkspace);
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
