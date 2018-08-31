# Environment Settings

The process environment contains sensitive information such as connection strings for data sources, security information and API keys. These should never be made public and are not contained in this repository.

Running the application without any environment settings \(zero-configuration\) will host a sample application with a single OSM base layer on port 3000.

In Visual Studio Code we recommend to store the environment settings in the `env:{}` object of the .launch file.

During [startup](server.md), [server.js](https://github.com/GEOLYTIX/xyz/blob/master/server.js) will check for [dotenv](https://www.npmjs.com/package/dotenv). If found the dotenv settings will be loaded as environment settings.

For deployments on Ubuntu server we use the [PM2](https://github.com/Unitech/pm2) process manager to run multiple instances of the framework on different ports on the same server. Environment settings for PM2 instances can be provided from a json document. `pm2 start myapplication.json`

For serverless deployments we use [Zeit Now environment variables](https://zeit.co/blog/environment-variables-secrets).

Following environment keys are recognised by the XYZ server process.

`"PORT": "3000"`

The port on which the application is run. Defaults to 3000.

`"DIR": "/open"`

The path for the application root. Aliased to geolytix.xyz the application will be accessible via [geolytix.xyz/open](https://geolytix.xyz/open).

`"ALIAS": "geolytix.xyz"`

The domain alias to be used in email notifications. Without an alias defined the application will reference the [host value from the request header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host).

`"HTTP": "http"`

Useful for debugging links on localhost the HTTP flag can be set. By default all links will be https.

Workspace

`"WORKSPACE": "file:demo.json"`

References a [workspace](workspaces/) for the XYZ deployment. With the `file:` prefix the server will look for a workspace document in the [in the workspaces directory](https://github.com/GEOLYTIX/xyz/tree/master/workspaces) of the repository. It is recommended to store workspaces in a PostgreSQL table. A [pg-connection-string](https://github.com/iceddev/pg-connection-string) must be provided with credentials to connect to the database. The table name for the workspace are seperated by a \| from the connection string.

e.g. `"postgres://username:password@123.123.123.123:5432/database|schema.table"`

**Access**

`"PUBLIC": "postgres://username:password@123.123.123.123:5432/database|schema.table"`

[Client and API access](security/access/) are defined with the `"public"` or `"private"` environment variable. Public access without the possibility of administrative access are the default if no access environment variable is provided. Public access with a [pg-connection-string](https://github.com/iceddev/pg-connection-string) which references a PostgreSQL access control list \(ACL\) allows for private and administrator accounts to be used alongside public access. Setting a private environment variable for access disables public access and requires user to login in order to receive a token for private or administrative access.

`"TRANSPORT": "smtps://xyz%40geolytix.co.uk:password@smtp.gmail.com"`

An SMTP connection string which is required by the [nodemailer](https://nodemailer.com/smtp) module to send emails. The XYZ server must be able to send emails in order for user to register and verify their accounts.

`"FAILED_ATTEMPTS": "3"`

The maxmimum number of [failed attempts](security/access/failed-login-attempts.md) before a user account is locked. Defaults to 3.

`"SECRET": "ChinaCatSunflower"`

A secret which is required to sign and verify [token](security/jwt-token.md) which are used to store user name and access privileges.

**Database Connections**

`"DBS_XYZ": "postgres://username:password@123.123.123.123:5432/database"`

Keys beginning with DBS\_ store PostGIS data source connections. During [startup](server.md) the keys are used to register PostgreSQL database connections. The remainder of the `"DBS_***"` string is the key for the database connection. This key must be referenced as the dbs parameter in [layer](workspaces/locales/layers.md) definitions.

**3rd Party Service Provider**

Keys for 3rd party service provider are stored in the environment. The client will send all requests to the XYZ server. Here the requests are decorated with the key and proxied to the provider.

`"KEY_GOOGLE": "key=***"`

A [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) which is required if Google Maps Services such as Distance Matrices or Geocoding are used.

`"KEY_MAPBOX": "access_token=pk.***"`

A [Mapbox access token](https://www.mapbox.com/help/how-access-tokens-work) which is required if Mapbox base maps and/or Mapbox services such as Distance Matrices or Geocoding are referenced by the XYZ api.

`"KEY_HERE": "app_id=***&app_code=***"`

A [HERE API](https://developer.here.com) key which is required if HERE base maps and/or services such as Distance Matrices are used.

`"IMAGES": "cloudinary api_key api_secret cloud_name folder",`

A [Cloudinary](https://cloudinary.com/) key, secret and folder for images to be stored.

