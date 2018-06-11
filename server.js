process.on('unhandledRejection', err => console.error(err));

const req_res = (m) => { try { return require.resolve(m) } catch (e) { console.log('Cannot resolve ' + m); return false } }

const dotenv = req_res('dotenv') ? require('dotenv') : null;
if (dotenv) dotenv.load();


const fastify = require('fastify')();


// Set globals for API keys, Database connections, etc.
global.appRoot = require('path').resolve(__dirname);
global.site = (process.env.HOST || ('localhost:' + (process.env.PORT || '3000'))) + (process.env.DIR || '');

global.KEYS = {};
Object.keys(process.env).map(key => {
    if (key.split('_')[0] === 'KEY') {
        global.KEYS[key.split('_')[1]] = process.env[key];
    }
});


global.DBS = {};
Object.keys(process.env).forEach(async key => {
    if (key.split('_')[0] === 'DBS') {
        await fastify.register(require('fastify-postgres'), {
            connectionString: process.env[key],
            name: key.split('_')[1]
        });
        global.DBS[key.split('_')[1]] = await fastify.pg[key.split('_')[1]].connect()
    }
});


fastify.register(require('fastify-formbody'));

fastify
    .register(require('fastify-cookie'))
    .register(require('fastify-caching'))
    .register(require('fastify-server-session'), {
        secretKey: 'some-secret-password-at-least-32-characters-long',
        sessionMaxAge: 900000, // 15 minutes in milliseconds
        sessionCookieName: 'glx-xyz-session',
        cookie: {
            //domain: '.example.com',
            path: '/'
        }
    });

let login = process.env.LOGIN || process.env.ADMIN;

if (login && login.split(':')[0] === 'postgres') login_connect();

async function login_connect(){
    await fastify.register(require('fastify-postgres'), {
        connectionString: login.split('|')[0],
        name: 'LOGIN'
    });
    global.DBS['LOGIN'] = await fastify.pg['LOGIN'].connect();
}

// Initialise waterline ORM for appsettings and user profiles.
// require('./waterline');


fastify.register(require('fastify-static'), {
    root: require('path').join(__dirname, 'public'),
});

require('./routes')(fastify);

const port = process.env.PORT || 3000;
fastify.listen(port, err => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log('The magic happens on port ' + port);
});