const req_res = (m) => { try { return require.resolve(m) } catch (e) { console.log('Cannot resolve ' + m); return false } }

const dotenv = req_res('dotenv') ? require('dotenv') : null;
if (dotenv) dotenv.load();

const port = process.env.PORT || 3000;
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = process.env.OURSECRET ? require('express-session') : null;
const helmet = require('helmet');
const morgan = req_res('morgan') ? require('morgan') : null;

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(helmet.noCache());

// Set globals for API keys, Database connections, etc.
global.appRoot = path.resolve(__dirname);
global.site = (process.env.HOST || ('localhost:' + (process.env.PORT || '3000'))) + (process.env.DIR || '');

global.KEYS = {};
Object.keys(process.env).map(key => {
    if (key.split('_')[0] === 'KEY') {
        global.KEYS[key.split('_')[1]] = process.env[key];
    }
});

const { Client } = require('pg');
global.DBS = {};
Object.keys(process.env).map(key => {
    if (key.split('_')[0] === 'DBS') {
        global.DBS[key.split('_')[1]] = new Client({ connectionString: process.env[key] });

        // connect reconnect issue
        global.DBS[key.split('_')[1]].connect();
    }
});

app.use(process.env.DIR || '', express.static(path.join(__dirname, 'public')));
if (morgan) app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// for blobs that contain image
app.use(bodyParser.raw({ limit: '50mb' }));

// Set app to use session with secret provided in environment settings.
app.use(session({
    secret: process.env.OURSECRET || 'ChinaCatSunflower',
    resave: true,
    saveUninitialized: true
}));

// Initialise waterline ORM for appsettings and user profiles.
require('./waterline');

if (process.env.LOGIN || process.env.ADMIN) {
    const security = require('./security');
    app.use(security.passport.initialize());
    app.use(security.passport.session());
}

app.use(process.env.DIR || '', require('./router'));

process.on('unhandledRejection', err => console.error(err));

app.listen(port);
console.log('The magic happens on port ' + port);