---
title: Environment Settings
tags: [getting-started]
layout: root.html
---

# Environment settings

The XYZ process can be configured by providing environment variables. The process environment contains sensistive information such as connection strings for the data source layer.

A default workspace with a single OSM tile layer will be avilable if the XYZ process is executed without any environment variables defined.

`PORT: "3000"`

By default the express.js script will listen for requests on port 3000. The PORT environment entry may override the listening port. 

`TITLE: "GEOLYTIX | XYZ"`

The title will passed as `<title>` tag to the default application views. The title value will also be used as cookie-name in the set-cookie header.

`DIR: "/open"`

The path for the application root. This allows to host multiple deployments with different DIR on the same domain.

## Workspace

`WORKSPACE: "file:dev.json"`

With the `file:` prefix the server will look for a workspace document in the public/workspaces directory.

The workspace may be retrieved from a CDN if the url responds with a valid JSON response.

`WORKSPACE: "https://cdn.jsdelivr.net/gh/GEOLYTIX/xyz/public/workspaces/dev.json"`

It is recommended to store workspaces on Github. Workspaces must not contain sensitive information and maybe be stored in public repositories. If stored in a private repository a valid `KEY_GITHUB` must be provided.

`WORKSPACE: "github://api.github.com/repos/GEOLYTIX/xyz/contents/public/workspaces/dev.json"`


## PostGIS Database Connections

Connection strings must be provided for all data sources which are referenced in a workspace.

`"DBS_XYZ": "postgres://username:password@123.123.123.123:5432/database"`

Keys beginning with DBS\_ store PostGIS data source connections. The remainder of the `"DBS_***"` string is the key for the database connection. This key must be referenced as the dbs parameter for all queries to the data source layer.

Each query which is passed via node-postgres to the data source layer will timeout after 10 seconds. It is possible to overwrite the default timeout by setting the `STATEMENT_TIMEOUT` key in the environment settings.

`STATEMENT_TIMEOUT: 10000`

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