# XYZ

A Node.js framework to develop applications and APIs for spatial data.

## Introduction

The XYZ framework is designed around the idea to serve spatial data from PostGIS datasources. The framework is modular with dependencies on third party open source modules such as the open GIS engine [Turf](https://github.com/Turfjs/turf), the authentication middleware [Passport](https://github.com/jaredhanson/passport) and the [Leaflet](https://github.com/Leaflet/Leaflet) javascript engine for interactive maps.

## Licence

Free use of the code in this repository is allowed through a [MIT licence](https://github.com/GEOLYTIX/xyz/blob/master/LICENSE).

## Dependencies

We are currently using Node.js version 8.4.

Style sheets are written with SASS/SCSS. We are currently including compiled css in the repository. With SASS installed it is possible to compile all style sheets with following command *sass -update public/css* from the application root. It is envisagened to move to Stylus in a future build and drop the Ruby development dependency.

The application is compiled with Webpack/Babel. We use Webpack 3.0 in the master branch and do not inlcude compiled bundles in this repository. The [xyz entry code](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.js) can be compiled with the *npm run build* command from the root.

## Settings

Two sets of settings are required to run the framework and host an application.

### Environment Settings

The environment settings which contain sensitive information such as data source connection strings, security information and API keys are not contained in this repository. Below is a list of environment settings which are required to run the framework.

"DBS_XYZ": "postgres://username:password@123.123.123.123:5432/database",
"DBS_GHS": "postgres://username:password@123.123.123.123:5432/database",
"DBS_MVT": "postgres://username:password@123.123.123.123:5432/database",
"SUBDIRECTORY": "xyz",
"APPSETTINGS": "demo.json",
"PORT": "3000",
"GKEY": "google maps api key",
"MAPBOX": "mapbox api key",
"GNAMES": "geolytix",
"NODE_ENV": "development",
"MONGODB": "mongodb://localhost:27017/database",
"TRANSPORT": "smtps://geolytix%40gmail.com:password@smtp.gmail.com",
"OURSECRET": "ChinaCatSunflower",
"HOST": "localhost:3000",
"LOCALHOST": "http://localhost:3000/xyz/"

In Visual Studio code this settings are usually stored in the .env settings file.

We use the [PM2](https://github.com/Unitech/pm2) process manager in our production environment to run multiple instances of the framework on different ports on the same server.

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
