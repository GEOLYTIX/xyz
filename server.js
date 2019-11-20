// Catch unhandled errors on the process.
process.on('unhandledRejection', err => {
  console.error({err})
  if(err === 666) {
    console.log("Please check the ACL!")
    process.exit();
  }
});

process.on('uncaughtException', err => {
  console.error({err})
});

// Function to check whether a required module is available.
const req_res = m => {
  try {
    require.resolve(m);
    return require(m);

  } catch (e) {

    console.log('Cannot resolve ' + m);
    return false;
  }
};

// Load environment from dotenv if available.
const dotenv = req_res('dotenv');

dotenv && dotenv.config();

// Initiate environment module.
const env = require('./mod/env');

// Create PostGIS dbs connection pools.
require('./mod/pg/dbs')();

// Create PostgreSQL ACL connection pool.
require('./mod/pg/acl')();

// Create PostgreSQL Workspace connection pool.
require('./mod/workspace/init')();

// Set fastify
const fastify = require('fastify')({
  trustProxy: true,
  logger: {
    level: env.logs || 'error',
    prettifier: require('pino-pretty'),
    prettyPrint: {
      errorProps: 'hint, detail',
      levelFirst: true,
      crlf: true
    }
  }
});

// Register fastify modules and routes.
fastify
  .register(require('fastify-helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: env.CSP.defaultSrc || ['\'self\''],
        baseURI: env.CSP.baseURI || ['\'self\''],
        objectSrc: env.CSP.objectSrc || ['\'self\''],
        workerSrc: env.CSP.workerSrc || ['\'self\'', 'blob:'],
        frameSrc: env.CSP.frameSrc || ['\'self\'', 'www.google.com', 'www.gstatic.com'],
        formAction: env.CSP.formAction || ['\'self\''],
        styleSrc: env.CSP.styleSrc || ['\'self\'', '\'unsafe-inline\'', 'fonts.googleapis.com', 'cdn.jsdelivr.net'],
        fontSrc: env.CSP.fontSrc || ['\'self\'', 'fonts.gstatic.com', 'cdn.jsdelivr.net'],
        scriptSrc: env.CSP.scriptSrc || ['\'self\'', '\'unsafe-inline\'', 'www.google.com', 'www.gstatic.com', 'cdn.jsdelivr.net'],
        imgSrc: env.CSP.imgSrc || ['\'self\'', 'api.ordnancesurvey.co.uk', '*.tile.openstreetmap.org', 'api.mapbox.com', 'res.cloudinary.com', '*.global.ssl.fastly.net', 'cdn.jsdelivr.net', 'data:']
      },
      setAllHeaders: true
    },
    // Must be set to false to allow iframe embeds.
    frameguard: false,
    noCache: true
  })
  .register(require('fastify-cors'), {
    origin: true
  })
  .register(require('fastify-formbody'))
  .register(require('fastify-static'), {
    root: require('path').resolve(__dirname) + '/public',
    prefix: env.path
  })
  .register(require('fastify-auth'))
  .decorate('login', require('./routes/login')(fastify))
  .decorate('authToken', require('./mod/authToken')(fastify))
  .decorate('evalParam', require('./mod/evalParam'))
  .register(require('fastify-jwt'), {
    secret: env.secret
  })
  .register(require('fastify-swagger'), {
    routePrefix: env.path + '/swagger',
    exposeRoute: true,
  })
  .addContentTypeParser('*', (req, done) => done())
  .register((fastify, opts, next) => {
    require('./routes/_routes')(fastify);
    next();
  }, { prefix: env.path });


fastify.listen(env.port, '0.0.0.0', err => {
  if (err) {
    Object.keys(err).forEach(key => !err[key] && delete err[key]);
    console.error(err);
    process.exit(1);
  }

  fastify.swagger();

  console.log('Fastify listening for requests.');
});