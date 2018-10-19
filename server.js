// Catch unhandled errors on the process.
process.on('unhandledRejection', err => console.error(err));

// Function to check whether a required module is available.
const req_res = m => {
  try {
    return require.resolve(m);
  } catch (e) {
    console.log('Cannot resolve ' + m);
    return false;
  }
};

// Set dotenv if the module is available
const dotenv = req_res('dotenv') ? require('dotenv') : null;

// Load environment from dotenv if available.
if (dotenv) dotenv.load();

// Set fastify
const fastify = require('fastify')({
  logger: {
    level: process.env.LOG_LEVEL || 'error',
    prettifier: require('pino-pretty'),
    prettyPrint: {
      errorProps: ['hint', 'detail'],
      levelFirst: true,
      crlf: true
    }
  }
});

// Register fastify modules.
fastify
  .register(require('fastify-helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        baseURI: ['\'self\''],
        objectSrc: ['\'self\''],
        workerSrc: ['\'self\'', 'blob:'],
        frameSrc: ['\'self\'', 'www.google.com', 'www.gstatic.com'],
        formAction: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\'', 'fonts.googleapis.com'],
        fontSrc: ['\'self\'', 'fonts.gstatic.com'],
        scriptSrc: ['\'self\'', 'www.google.com', 'www.gstatic.com'],
        imgSrc: ['\'self\'', '*.tile.openstreetmap.org', 'api.mapbox.com', 'res.cloudinary.com', 'data:']
      },
      //reportOnly: true,
      setAllHeaders: true
    },
    noCache: true
  })
  .register(require('fastify-formbody'))
  .register(require('fastify-static'), {
    root: require('path').join(__dirname, 'public'),
    prefix: (process.env.DIR || '') + '/'
  })
  .register(require('fastify-auth'))
  .register(require('fastify-jwt'), {
    secret: process.env.SECRET || 'some-secret-password-at-least-32-characters-long'
  })
  .decorate('authAccess', (req, res, done) => require('./auth').authToken(req, res, fastify, {lv: global.access, API: false}, done))
  .decorate('authAPI', (req, res, done) => require('./auth').authToken(req, res, fastify, {lv: global.access, API: true}, done))
  .decorate('authAdmin', (req, res, done) => require('./auth').authToken(req, res, fastify, {lv: 'admin', API: false}, done))
  .decorate('authAdminAPI', (req, res, done) => require('./auth').authToken(req, res, fastify, {lv: 'admin', API: true}, done));

global.dir = process.env.DIR || '';

global.alias = process.env.ALIAS ? process.env.ALIAS : null;

global.access = process.env.PRIVATE ? 'private' : 'public';

global.failed_attempts = parseInt(process.env.FAILED_ATTEMPTS) || 3;

global.KEYS = {};
Object.keys(process.env).forEach(key => {
  if (key.split('_')[0] === 'KEY') {
    global.KEYS[key.split('_')[1]] = process.env[key];
  }
});
  
require('./auth').init(fastify);
  
require('./routes')(fastify);

require('./workspace')(fastify, startListen);

// Start to listen for requests (after workspaces are loaded).
function startListen(){
  fastify.listen(process.env.PORT || 3000, '0.0.0.0', err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }  
  
    console.log(`Serving ${global.workspace.admin.config.title} workspace.`);
  });
}