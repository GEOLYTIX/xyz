process.on('unhandledRejection', err => console.error(err));

const req_res = m => { try { return require.resolve(m) } catch (e) { console.log('Cannot resolve ' + m); return false } }

const dotenv = req_res('dotenv') ? require('dotenv') : null;

if (dotenv) dotenv.load();

const fastify = require('fastify')({
        // http2: true,
        // https: {
        //     allowHTTP1: true, // fallback support for HTTP1
        //     key: require('fs').readFileSync('/home/dennis/.ssl/server.key'),
        //     cert: require('fs').readFileSync('/home/dennis/.ssl/server.crt')
        // },
        logger: {level: 'error'}
    });

fastify
    .register(require('fastify-helmet'), {
        noCache: true
    })
    .register(require('fastify-formbody'))
    .register(require('fastify-static'), {
        root: require('path').join(__dirname, 'public'),
        prefix: (process.env.DIR || '') + '/'
    })
    .register(require('fastify-cookie'))
    .register(require('fastify-auth'))
    .register(require('fastify-jwt'), {
        secret: process.env.SECRET || 'some-secret-password-at-least-32-characters-long'
    })
    .decorate('authAccess', (req, res, done) => require('./auth').authToken(req, res, fastify, global.access, done))
    .decorate('authAdmin', (req, res, done) => require('./auth').authToken(req, res, fastify, 'admin', done));

require('./globals')(fastify);

require('./workspace')(fastify);

require('./auth').init(fastify);

require('./routes')(fastify);

fastify.listen(process.env.PORT || 3000, '0.0.0.0', err => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log('Black alert: Fastify ready to engage.');
});