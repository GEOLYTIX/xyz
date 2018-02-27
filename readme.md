# XYZ

A Node.js framework to develop applications and APIs for spatial data.

## Introduction

The XYZ framework is designed around the idea to serve spatial data from PostGIS datasources without the need of additional services running elsewhere. The framework is modular with dependencies on third party open source modules such as the open GIS engine [Turf](https://github.com/Turfjs/turf), the authentication middleware [Passport](https://github.com/jaredhanson/passport), the [Leaflet](https://github.com/Leaflet/Leaflet) javascript engine for interactive maps and [Google Pupetteer](https://github.com/GoogleChrome/puppeteer) to create PDF reports on the server-side.

## Licence

Free use of the code in this repository is allowed through a [MIT licence](https://github.com/GEOLYTIX/xyz/blob/master/LICENSE).

## Dependencies

We are currently using Node.js version 8.4.

Style sheets are written with SASS/SCSS. We are currently including compiled css in the repository. With SASS installed it is possible to compile all style sheets with following command `sass -update public/css` from the application root. It is envisagened to move to Stylus in a future build and drop the Ruby development dependency.

The application is compiled with Webpack/Babel. We use Webpack 3.0 in the master branch and do not inlcude compiled bundles in this repository. The [xyz entry code](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.js) can be compiled with the `npm run build` command from the root.

## Settings

Two sets of settings are required to run the framework and host an application.

### Environment Settings

The environment settings which contain sensitive information such as data source connection strings, security information and API keys are not contained in this repository. Below is a list of environment settings which are required to run the framework. In Visual Studio code this settings are usually stored in the debug .launch settings.

We use the [PM2](https://github.com/Unitech/pm2) process manager in our production environment to run multiple instances of the framework on different ports on the same server. With PM2 we store the settings in a json document which is used to start the application using the command: `pm2 start myapplication.json`

__"NODE_ENV": "development"__
Whether the application is run in a development or production environment.

**"PORT": "3000"**
The port on which the application is run.

**"HOST": "geolytix.xyz/demo"**
The host is required in order to send correct verification or media links.

**"LOCALHOST": "http://localhost:3000/xyz/"**
The localhost is required for server side reporting.

**"SUBDIRECTORY": "xyz"**
The name of the application root directory. This is required by the Express router to set the public directory.

**"MONGODB": "mongodb://localhost:27017/database"**
The location of the mongo database in which the user accounts are stored for applications and services which require passport authentication.

**"TRANSPORT": "smtps://geolytix%40gmail.com:password@smtp.gmail.com"**
An SMTP connection string which is required for the application to send emails. The passport security module uses this mail account to send verification requests to new registrants.

**"OURSECRET": "ChinaCatSunflower"**
A session secret which is used to compute the Hash.

**"APPSETTINGS": "demo.json"**
The name of the appsettings file ([in the settings subdirectory](https://github.com/GEOLYTIX/xyz/tree/master/settings)) which holds the settings for the application and/or services which are hosted in this instance of the framework. The APPSETTINGS will be discussed in detail in the next section of this documentation.

**"DBS_XYZ": "postgres://username:password@123.123.123.123:5432/database"**
**"DBS_MVT": "postgres://username:password@123.123.123.123:5432/database"**
Keys beginning with DBS_ store PostGIS data source connections. Modules which require connections to PostGIS data sources via the [node-postgres](https://github.com/brianc/node-postgres) read the connection strings from the DBS_* keys, split the key and store the connection in a an object (DBS) with the remainder of the DBS_* key as key for the connection object. This key can be referenced in the dbs XHR request parameter where required. This allows different services and layers to connect to different data sources in the same hosted API. Any dbs keys defined in the application settings object (\_XYZ) must be referenced with a matching DBS_* key and connection string. E.g. A layer with dbs:XYZ requires DBS_XYZ with a valid connection string in the environment settings. Please reference [pg-connection-string] which is used by node-postgres to connect to a data source from a connection string.

**"GKEY": "google maps api key"**
A Google Maps API key which is required if Google Maps Services such as Distance Matrices or Geocoding are referenced by the XYZ api.

**"MAPBOX": "mapbox api key"**
A Mapbox API key which is required if Mapbox base maps and/or Mapbox services such as Distance Matrices or Geocoding are referenced by the XYZ api.

### Application Settings

Application settings are stored in the [/settings](https://github.com/GEOLYTIX/xyz/tree/master/settings) directory. Application settings control instance specific settings for layers, styles, locales and which modules should be loaded by client applications. Below is a list of settings which are currently supported by the framework.

## Server

[server.js](https://github.com/GEOLYTIX/xyz/blob/master/server.js) starts an [Express](https://expressjs.com/) server on the specified port, sets the public directory, favicon and passport security from the environment settings. *Clustering is still very much in development and not fully supported yet.*

## Middleware

[router.js](https://github.com/GEOLYTIX/xyz/blob/master/router.js) is the middlewares main entry point.

## Security

Access to any method or data source served through the XYZ framework can be restricted through the authentication middleware [Passport](http://www.passportjs.org/). The [passport-local](https://github.com/jaredhanson/passport-local) strategy in combination with cookie sessions is used as default authentication method. *The implementation of JSON Web Tokens is planned for a future feature release.*  

The default strategy uses a local MongoDB database in which users account are registered. XYZ endpoints allow for accounts to be created, removed, authenticated, approved and authorized.  

User accounts consist of an email address and password only. It is possible to create user accounts which are not email addresses. These accounts must be authenticated by an administrator or directly in the database.  

**Authentication** is the process of ascertaining that somebody really is who he claims to be. Once a user creates a new account an automated email will be sent from the passport module to the email address provided by the user. This email contains a link which is valid for 1 hour. Users authenticate accounts by following the link and thus proving that they have access to the email account which has been provided in the registration request.

Account **approval** is an administrative process. Adminstrator accounts can send requests to the passport middleware that they recognise the email address of an account and approve access for the account.

A new database will be created when the first user account is registered. In order to approve this user and give administrative rights to the account open a mongo console to use the database and manually update the account like so:

`db.users.update({"email":"dennis.bauszus@geolytix.co.uk"},{$set:{"verified":true, "approved":true, "admin":true}})`
