# Environment Settings

  
The process environment contains sensitive information such as connection strings for data sources, security information and API keys. These should never be made public and are not contained in this repository.

Running the application without any environment settings \(zero-configuration\) will host a sample application with a single OSM base layer on port 3000.

In Visual Studio Code we recommend to store the environment settings in the env:{} object of the .launch file.

During startup, server.js will check for [dotenv](https://www.npmjs.com/package/dotenv). If found the dotenv settings will be loaded as environment settings.

For deployments on a Ubuntu server we use the [PM2](https://github.com/Unitech/pm2) process manager in our production environment to run multiple instances of the framework on different ports on the same server. With PM2 we store the settings in a json document which is used to start the application using the command: `pm2 start myapplication.json`

For serverless deployments we use Zeit Now and provide environment variables with -e flag.

Following environment keys are recognised:

`"PORT": "3000"`

The port on which the application is run. Defaults to 3000.

`"DIR": "/xyz"`

The path for the application root.

`"ALIAS": "geolytix.xyz"`

The domain alias to be used in email notifications.

`"WORKSPACE": "file:demo.json"`

The name of a _workspace_ configuration file \([in the workspaces directory](https://github.com/GEOLYTIX/xyz/tree/master/workspaces)\) which holds the settings for the application and/or services which are hosted in a deployment.

It is recommended to store the workspace configuration in a Postgres table. In this case the table name must be declared after a pipe in the Postgres connection string.

e.g. `"WORKSPACE": "postgres://username:password@123.123.123.123:5432/database|schema.table"`

`"PUBLIC": "postgres://username:password@123.123.123.123:5432/database|schema.table"`

The location of an Access Control List \(ACL\) table in Postgres. No login is required if this key is omitted. Setting the key to public allows user to login to a private workspace and administrator to the admin views for the management of the workspace and ACL. Setting the key to PRIVATE will prevent access without login.

`"TRANSPORT": "smtps://xyz%40geolytix.co.uk:password@smtp.gmail.com"`

An SMTP connection string which is required for the application to send emails. The passport security module uses this mail account to send verification requests to new registrants.

`"FAILED_ATTEMPTS": "3"`

The maxmimum number of failed attempts before a user account is locked. Defaults to 3.

`"SECRET": "ChinaCatSunflower"`

A secret which is required to encrypt tokens which are used to store user credentials and session information. Should be longer than 32 characters!

`"DBS_XYZ": "postgres://username:password@123.123.123.123:5432/database"`

Keys beginning with DBS\_ store PostGIS data source connections. During startup the keys are read and stored in the global.DBS object. The remainder of the DBS\_\*\*\* string is the key for the connection object. This key can be referenced as the dbs parameter in XHR requests sent from the client. This allows different services and layers to connect to different data sources in the same hosted API. Any dbs keys defined in the application settings object \(\_XYZ\) must be referenced with a matching DBS\_\* key and connection string. E.g. A layer with dbs:XYZ requires DBS\_XYZ with a valid connection string in the environment settings. Please reference \[pg-connection-string\] which is used by node-postgres to connect to a data source from a connection string.

Similar to the DBS connection strings the API keys which are defined in the environment settings are stored in the global.KEYS object. The remainder of the KEY\_\*\*\* string is the key for the request object. The key is provided as _provider_parameter in XHR requests from the client.

`"KEY_GOOGLE": "key=***"`

A Google Maps API key which is required if Google Maps Services such as Distance Matrices or Geocoding are referenced by the XYZ api.

`"KEY_MAPBOX": "access_token=pk.***"`

A Mapbox API key which is required if Mapbox base maps and/or Mapbox services such as Distance Matrices or Geocoding are referenced by the XYZ api.

`"KEY_HERE": "app_id=***&app_code=***"`

A HERE API key which is required if HERE base maps are used.

`"IMAGES": "cloudinary api_key api_secret cloud_name folder",`

We use [cloudinary](https://cloudinary.com/) to store images uploaded from the browser application interface.

