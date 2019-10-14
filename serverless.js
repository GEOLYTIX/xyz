// Catch unhandled errors on the process.
process.on('unhandledRejection', err => console.error(err));

// Initiate environment module.
const env = require('./mod/env');

// Create PostGIS dbs connection pools.
require('./mod/pg/dbs')();

// Create PostgreSQL ACL connection pool.
require('./mod/pg/acl')();

// Create PostgreSQL Workspace connection pool.
require('./mod/workspace/init')();

const serverFactory = (handler, opts) => {
  const server = require('http').createServer((req, res) => {
    handler(req, res);
  });
  
  return server;
};

const fastify = require('fastify')({
  serverFactory,
  modifyCoreObjects: false,
  trustProxy: true,
});

// Register fastify modules and routes.
fastify
  .register(require('fastify-helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\'', '*.logrocket.io'],
        baseURI: ['\'self\''],
        objectSrc: ['\'self\''],
        workerSrc: ['\'self\'', 'blob:'],
        frameSrc: ['\'self\'', 'www.google.com', 'www.gstatic.com'],
        formAction: ['\'self\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\'', 'fonts.googleapis.com'],
        fontSrc: ['\'self\'', 'fonts.gstatic.com'],
        scriptSrc: ['\'self\'', 'www.google.com', 'www.gstatic.com', '*.logrocket.io'],
        imgSrc: ['\'self\'', '*.tile.openstreetmap.org', 'api.mapbox.com', 'res.cloudinary.com', 'data:']
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
    prefix: env.path// + '/public'
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