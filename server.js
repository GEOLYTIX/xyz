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
    // }
});

fastify
    .register(require('fastify-helmet'), {
        noCache: true
    })
    .register(require('fastify-formbody'))
    .register(require('fastify-static'), {
        root: require('path').join(__dirname, 'public'),
    })
    .register(require('fastify-cookie'))
    .register(require('fastify-caching'))
    .register(require('fastify-auth'))
    .register(require('fastify-server-session'), {
        secretKey: process.env.SECRET || 'some-secret-password-at-least-32-characters-long',
        sessionMaxAge: 600000, // 10 minutes in milliseconds
        sessionCookieName: 'glx-xyz-session',
        cookie: {
            //domain: '.geolytix.xyz',
            path: '/'
        }
    });

require('./globals')(fastify);

require('./routes')(fastify);

fastify.listen(process.env.PORT || 3000, err => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log('Black alert: Fastify ready to engage.');
});