const req_res = (m) => { try { return require.resolve(m) } catch (e) { console.log('Cannot resolve ' + m); return false } }

const dotenv = req_res('dotenv') ? require('dotenv') : null;
if (dotenv) dotenv.load();

const port = process.env.PORT || 3000;
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const morgan = req_res('morgan') ? require('morgan') : null;

if (process.env.NODE_ENV === 'cluster') {
    const cluster = require('cluster');
    const numCPUs = require('os').cpus().length;

    if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);
    
        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    
        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
        });
        
    } 
}

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    const app = express();
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(helmet.noCache());
    app.use('/' + process.env.SUBDIRECTORY, express.static(path.join(__dirname, 'public')));
    if (morgan) app.use(morgan('dev'));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    
     // for blobs that contain image
    app.use(bodyParser.raw({limit: '50mb'}));

    // Set app to use session with secret provided in environment settings.
    app.use(session({
        secret: process.env.OURSECRET,
        resave: true,
        saveUninitialized: true
    }));

    if (process.env.LOGIN) {
        const passport = require('./mod/' + 'passport');
        app.use(passport.initialize());
        app.use(passport.session());
    }

    app.use('/' + process.env.SUBDIRECTORY, require('./router'));

    app.listen(port);
    console.log('The magic happens on port ' + port);
}