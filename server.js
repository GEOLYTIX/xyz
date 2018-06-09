process.on('unhandledRejection', err => console.error(err));

const req_res = (m) => { try { return require.resolve(m) } catch (e) { console.log('Cannot resolve ' + m); return false } }

const dotenv = req_res('dotenv') ? require('dotenv') : null;
if (dotenv) dotenv.load();

const port = process.env.PORT || 3000;

const path = require('path');


// Set globals for API keys, Database connections, etc.
global.appRoot = path.resolve(__dirname);
global.site = (process.env.HOST || ('localhost:' + (process.env.PORT || '3000'))) + (process.env.DIR || '');

global.KEYS = {};
Object.keys(process.env).map(key => {
    if (key.split('_')[0] === 'KEY') {
        global.KEYS[key.split('_')[1]] = process.env[key];
    }
});

// const { Client } = require('pg');
// global.DBS = {};
// Object.keys(process.env).map(key => {
//     if (key.split('_')[0] === 'DBS') {
//         global.DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });

//         // connect reconnect issue
//         global.DBS[key.split('_')[1]].connect();
//     }
// });



// Initialise waterline ORM for appsettings and user profiles.
// require('./waterline');


// Require the framework and instantiate it
const fastify = require('fastify')()

// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
});

// Run the server!
fastify.listen(port, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  console.log('The magic happens on port ' + port);
});