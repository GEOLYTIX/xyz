process.on('unhandledRejection', err => {
    console.error(err)
});

const req_res = m => { try { return require.resolve(m) } catch (e) { console.log('Cannot resolve ' + m); return false } }

const dotenv = req_res('dotenv') ? require('dotenv') : null;

if (dotenv) dotenv.load();

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

fastify
    .register(require('fastify-helmet'), {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                baseURI: ["'self'"],
                objectSrc: ["'self'"],
                workerSrc: ["'self'", 'blob:'],
                frameSrc: ["'self'", 'www.google.com', 'www.gstatic.com'],
                formAction: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
                fontSrc: ["'self'", 'fonts.gstatic.com'],
                scriptSrc: ["'self'", 'www.google.com', 'www.gstatic.com'],
                imgSrc: ["'self'", '*.tile.openstreetmap.org', 'api.mapbox.com', 'res.cloudinary.com', 'data:']
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

require('./globals')(fastify);

require('./workspace')(fastify);

require('./auth').init(fastify);

require('./routes')(fastify);

fastify.listen(process.env.PORT || 3000, '0.0.0.0', err => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log(`Serving ${global.workspace.name} workspace.`);
});