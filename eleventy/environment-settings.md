---
title: Environment Settings

layout: root.html
---

# Environment settings

The XYZ process can be configured by providing environment variables. The process environment contains sensistive information such as connection strings for the data source layer.

A default workspace with a single OSM tile layer will be avilable if the XYZ process is executed without any environment variables defined.

`PORT: "3000"`

Setting the PORT environment variable will override the port on which express is listening for requests.

`TITLE: "GEOLYTIX | XYZ"`

The title will be used as cookie-name for authentication cookies set on the response header and passed as `<title>` tag to the default application views.

`DIR: "/open"`

The path for the application root. This allows for hosting multiple deployments with different paths on the same domain. **Rewrites in the vercel.json must be prefixed with the DIR value if set.**

## Workspace

The [workspace](/xyz/docs/workspace/workspaces) is a configuration of templates, locales, and layers available to the XYZ host. The workspace is a JSON document which may be located locally, on Github, or in a CDN.

`WORKSPACE: "https://geolytix.github.io/xyz/public/workspaces/dev.json"`

Any http(s) url which resolves to a JSON document without the need for authentication is valid.

`WORKSPACE: "file:dev.json"`

The XYZ host will look in the local directory public/workspaces for a matching file with the `file:` prefix in WORKSPACE variable value.

`WORKSPACE: "github:api.github.com/repos/GEOLYTIX/xyz_ressources/contents/mapp/workspace.json"`

The `github:` prefix will request the workspace document through the provider module. Requests for content from private Github repositories require a personal access token which can be generated at [github.com/settings/tokens](https://github.com/settings/tokens). The token value must be provided as the `KEY_GITHUB` environment variable value.

`WORKSPACE: "cloudfront:dev.geolytix.io/mapp/workspace.json"`

The `cloudfront:` prefix will request the workspace document through the provider module. A private key for AWS cloudfront must be provided in the XYZ root. The name of the key file, excluding the .pem extension must be provided as the `KEY_CLOUDFRONT` environment variable value.

## PostGIS Database Connections

Connection strings must be provided for all data sources which are referenced in a workspace.

`"DBS_XYZ": "postgres://username:password@pg.geolytix.net:5432/database"`

Keys beginning with DBS\_ store PostGIS data source connections. The remainder of the `"DBS_***"` string is the key for the database connection. This key must be referenced as the dbs parameter for all queries to the data source layer.

`STATEMENT_TIMEOUT: 10000`

Each query which is passed via node-postgres to the data source layer will timeout after 10 seconds. It is possible to overwrite the default timeout by setting the `STATEMENT_TIMEOUT` key in the environment settings.

## API Keys

Keys for 3rd party service provider must be in the environment settings for the XYZ host to access and proxy these services. A request proxied through the XYZ domain layer will not expose the keys used to the client.

`"KEY_GOOGLE": "key=***"`

A [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) required for the Google Maps API.

`"KEY_MAPBOX": "access_token=pk.***"`

A [Mapbox access token](https://www.mapbox.com/help/how-access-tokens-work) required for base maps and services requested from the Mapbox API.

`"KEY_HERE": "app_id=***&app_code=***"`

A [HERE API](https://developer.here.com) key required for base maps and services requested from the HERE Maps API.

`"KEY_OS": "***"`

An Ordnance Survey API key. The key is required for access to services such as the [OS Zoomstack](https://www.ordnancesurvey.co.uk/business-government/tools-support/open-zoomstack-support) mapping layers.

`"CLOUDINARY": "api_key api_secret cloud_name folder"`

A [Cloudinary](https://cloudinary.com/) key, secret and folder for images to be stored.

`"KEY_OPENCAGE": "***"`

API key required to access the [Opencage geocoding service](https://opencagedata.com/api).

## SRC_* parameter

Can be used for parameter substitution in views, template src strings, or anywhere in a locale. The bracketed SRC_* parameter eg. `${SRC_CDN}/public/script.js` will be substituted with the value from matching process environment key. Substitution is applied when the view is rendered, templates are loaded into the workspace, and after defaults are assigned to the workspace locales.

## Logging

If enabled logs can be written from the execution of a serverless function to a log drain.

`LOGS: "true"`

Setting the `LOGS` environment variable to a *truthy* value will enable logging from the process execution.

`KEY_LOGFLARE: "***"`

Providing a Logflare ingest API key allows for logs to be sent to the Logflare API.

## Access

The access environment variable defines whether access to the XYZ API is restricted.

`PRIVATE: "postgres://username:password@pg.geolytix.net:5432/database|schema.table"`

Setting the `PRIVATE` access key requires authentication via token for all request sent to the XYZ API.

`PUBLIC: "postgres://username:password@pg.geolytix.net:5432/database|schema.table"`

By default access to the XYZ API is public. Providing an ACL connection string for the `PUBLIC` access variable allows the XYZ host to generate user token / cookies for elevated access to public endpoints.

`SECRET: "Look for a while at the china cat sunflower; Proud walking jingle in the midnight sun"`

The value of the `SECRET` environment variable is used to sign token for validation by the user authentication module.

`FAILED_ATTEMPTS: "3"`

Setting the `FAILED_ATTEMPTS` environment variable defines the number of failed login attempts after which a user account will be flagged as blocked.

`APPROVAL_EXPIRY: "5"`

Approved user accounts will expire after a number of days defined in `APPROVAL_EXPIRY` environment variable.

`TRANSPORT: "smtps://xyz%40geolytix.co.uk:password@smtp.gmail.com"`

User registration requires the XYZ host to send emails to registered user and administrator accounts. The value for the `TRANSPORT` environment must be a valid smtp(s) connection string.

`ALIAS: "geolytix.xyz"`

A domain `ALIAS` may be defined to overwrite the [host value from the request header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host) in mails send from the XYZ host. This is useful when domain rewrites are used.

The [XYZ Authentication Strategy](/xyz/docs/develop/security/authentication) is described in the developer documentation.