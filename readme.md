# XYZ

A Node.js framework to develop applications and APIs for spatial data.

tl;dr Here is a hosted version of the XYZ without login:
[https://geolytix.xyz/open](https://geolytix.xyz/open)

## Introduction

The XYZ framework is designed to serve spatial data from PostGIS datasources without the need of additional services. The framework is modular with dependencies on third party open source modules such as the open GIS engine [Turf](https://github.com/Turfjs/turf), the [Leaflet](https://github.com/Leaflet/Leaflet) javascript engine for interactive maps and [Google Puppeteer](https://github.com/GoogleChrome/puppeteer) to create server-side PDF reports.

XYZ is build with a [PfaJn stack](https://medium.com/@goldrydigital/a-fine-pfajn-stack-to-put-maps-on-the-web-bf1a531cae93) which uses the [Fastify](https://www.fastify.io) web server and [JsRender](https://www.jsviews.com) for server side rendering of views.

The code repository should work out of the box (zero-configuration) as serverless deployments with [Zeit Now]
(https://zeit.co/now) and [Google App Engine](https://cloud.google.com/appengine).

## Licence

Free use of the code in this repository is allowed through a [MIT licence](https://github.com/GEOLYTIX/xyz/blob/master/LICENSE).

## Dependencies

We are currently using Node.js version 8.5 in production.

Style sheets for the browser interface are written in SASS/SCSS. We include the compiled css in the repository. With SASS installed it is possible to compile all style sheets with following command `sass -update public/css` from the application root.

The application is compiled with Webpack (v4) and Babel. We target ES2015 with Babel polyfills for compatibility with Internet Explorer 11.

The [xyz entry code](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.js) can be compiled with the `npm run build` command from the root.

### Puppeteer

[Google Puppeteer](https://github.com/GoogleChrome/puppeteer) is used to generate PDF reports server-side. In it's current state the project install of Pupetteer takes 300mb out of a total 400mb worth of dependencies. It is recommended to install Puppeteer either global `sudo npm install puppeteer --global --unsafe-perm` and then set a link to the global install in the project folder `npm link puppeteer`. Otherwise Puppeteer can be installed local with `npm install puppeteer`.

## Environment Settings

The process environment contains sensitive information such as connection strings for data sources, security information and API keys. These should never be made public and are not contained in this repository.

Running the application without any environment settings (zero-configuration) will host a sample application with a single OSM base layer on port 3000.

In Visual Studio Code we recommend to store the environment settings in the env:{} object of the .launch file.

During startup, server.js will check for [dotenv](https://www.npmjs.com/package/dotenv). If found the dotenv settings will be loaded as environment settings.

We use the [PM2](https://github.com/Unitech/pm2) process manager in our production environment to run multiple instances of the framework on different ports on the same server. With PM2 we store the settings in a json document which is used to start the application using the command: `pm2 start myapplication.json`

Following environment keys are recognised:

`"PORT": "3000"`

The port on which the application is run. Defaults to 3000.

`"DIR": "/xyz"`

The path for the application root.

`"WORKSPACE": "file:demo.json"`

The name of a *workspace* configuration file ([in the workspaces directory](https://github.com/GEOLYTIX/xyz/tree/master/workspaces)) which holds the settings for the application and/or services which are hosted in a deployment.

It is recommended to store the workspace configuration in a Postgres table. In this case the table name must be declared after a pipe in the Postgres connection string.

e.g. `"WORKSPACE": "postgres://username:password@123.123.123.123:5432/database|schema.table"`

`"PUBLIC": "postgres://username:password@123.123.123.123:5432/database|schema.table"`

The location of an Access Control List (ACL) table in Postgres. No login is required if this key is omitted. Setting the key to public allows user to login to a private workspace and administrator to the admin views for the management of the workspace and ACL. Setting the key to PRIVATE will prevent access without login.

`"TRANSPORT": "smtps://xyz%40geolytix.co.uk:password@smtp.gmail.com"`

An SMTP connection string which is required for the application to send emails. The passport security module uses this mail account to send verification requests to new registrants.

`"FAILED_ATTEMPTS": "3"`

The maxmimum number of failed attempts before a user account is locked. Defaults to 3.

`"SECRET": "ChinaCatSunflower"`

A secret which is required to encrypt tokens which are used to store user credentials and session information. Should be longer than 32 characters!

`"TIMEOUT": "30"`

The maximum token age in seconds. Defaults to 30.

`"DBS_XYZ": "postgres://username:password@123.123.123.123:5432/database"`

Keys beginning with DBS_ store PostGIS data source connections. During startup the keys are read and stored in the global.DBS object. The remainder of the DBS_*** string is the key for the connection object. This key can be referenced as the  dbs parameter in XHR requests sent from the client. This allows different services and layers to connect to different data sources in the same hosted API. Any dbs keys defined in the application settings object (\_XYZ) must be referenced with a matching DBS_* key and connection string. E.g. A layer with dbs:XYZ requires DBS_XYZ with a valid connection string in the environment settings. Please reference [pg-connection-string] which is used by node-postgres to connect to a data source from a connection string.

Similar to the DBS connection strings the API keys which are defined in the environment settings are stored in the global.KEYS object. The remainder of the KEY_*** string is the key for the request object. The key is provided as *provider* parameter in XHR requests from the client.

`"KEY_GOOGLE": "key=***"`

A Google Maps API key which is required if Google Maps Services such as Distance Matrices or Geocoding are referenced by the XYZ api.

`"KEY_MAPBOX": "access_token=pk.***"`

A Mapbox API key which is required if Mapbox base maps and/or Mapbox services such as Distance Matrices or Geocoding are referenced by the XYZ api.

`"KEY_HERE": "app_id=***&app_code=***"`

A HERE API key which is required if HERE base maps are used.

`"IMAGES": "cloudinary api_key api_secret cloud_name folder",`

We use [cloudinary](https://cloudinary.com) to store images uploaded from the browser application interface.

## Workspaces

A workspace is the configuration of services, styles, layers and locations to be used in a deployment. File based configuration are stored in the [/workspaces](https://github.com/GEOLYTIX/xyz/tree/master/workspaces) directory. It is recommended to store the configuration object in a database in order manage the configurastion through admin views.

/admin/workspace

A [jsoneditor](https://github.com/josdejong/jsoneditor) tree view which allows modification of config keys, uploading configuration files into the view and saving the workspace configuragtion to a PostgreSQL table.

/admin/workspacejson

A code view (json) of the configuration object.

Below is a list of config keys which are currently supported. Default minimum viable settings will be set if no *workspace* has been defined in the deployment environment.

`"title": "XYZ Demo"`

The application title which will be inserted into the title meta tag in the HTML template.

`"gazetteer": {}`

Whether the gazetteer module should be enabled. Without the gazetteer module you will not be able to switch between locales

`"select": {}`

Whether the selection module should be enabled. Without the selection module you will not be able to select features and query their properties.

`"locate": true`

Whether the geolocator should be enabled. *Note that the geolocator requires a secure connection via https.*

`"documentation": "documentation"`

Whether a documentation button should be enabled. If set to 'documentation' the [documentation.md](https://github.com/GEOLYTIX/xyz/tree/dev/public/documentation.md) markhub will be displayed in a github flavoured view. Any suitable link can be set instead of 'documentation'.

`"locale": "UK"`

The default locale which is opened and set to the url hook parameter when an application is accessed. Defaults to the first locale in the locales object.

`"locales": {}`

### Locales

Locales are regional sub settings. Each locale is defined by it's name, bounds and a set of layers. A locale can be selected from the dropdown next to the input field in the gazetteer module. The dropdown will only be active if more than one locale object is defined in the *appsettings*. The locale 'Global' will be represented as a globe icon.

The current local is defined as url_hook. For example [https://geolytix.xyz/open/?locale=Global](https://geolytix.xyz/open/?locale=Global) will open the Global locale from the settings for the /open instance.

Each locale is a set of objects which are described here:

`"name": "Europe"`

The display name for the locale. The locale key will be used if not set.

`"bounds": [[25,-45],[75,60]]`

An array of \[lat,lon\] coordinate pairs which define the bounds of a locale. It will not be possible to pan the map outside the bounds. The default bounds are \[\[-90,-180\],\[90,180\]\].

`"minZoom": 5`

`"maxZoom": 9`

The min and max zoom for the leaflet map object. The defaults range is zoom 0 to 20 if not set.

`"gazetteer": ["MAPBOX", "", "'-45,25,60,75'", "e.g. Brussels"]`

The gazetteer to be used for the locale. The first entry in the array is the provider (MAPBOX or GOOGLE). A corresponding KEY_*** is required in the environment settings in order to use a 3rd party service. TO BE COMPLETED AFTER DATABASE GAZETTEER IMPLEMENTATION.

`"layers": {}`

### Layers

Layers are a sub setting of a locale. Each layer object has a set of parameters which depend on the type of layer, whether the layer is interactive or editable and how the data should be styled in the map window. `access` is a layer-specific privilege given to user role. Defaults to `"public"` which does not require login. Access set to `"private"` requires login in order to view content. Value `"admin"` allows all administrative operations and app configuration.

A layer may support the following parameters:

```javascript
 <layer identifier, SQL legal name recommended> : {
	 "name": <layer name to display>,
	 "meta": <meta string, data description>,
	 "pane": [<pane name>], 500], // Leaflet equivalent to z-index
	 "format": <"tiles", "mvt", "geojson" or "cluster">,
	 "dbs": <reference to connection string>,
	 "display": <boolean, if set to true layer is initially displayed>,
	 "qID": <field for feature identifier within dataset, default: "id">, // if undefined layer is non-interactive
	 "geom": <geometry field SRID 4326, default: "geom">,
	 "geom_3857": <geometry field SRID 3857, defaults to "geom_3857", parameter required for MVT layer only>,
	 "access": <"public", "private" or "admin", defaults to "public">,
	 "properties": <SQL list of additional fields to select and include within feature followed by comma, optional>,
	 "streetview": <supported by cluster layer, displays Google StreetView in data table for selected feature>,
     "hover": <boolean, enables tooltip on features, cluster layer only>,
     "geomdisplay": <field name for associated geometry for cluster layers if available, such as buffer or catchment, expected format PostGIS geometry SRID 4326, defaults to false>,
     "aggregate_layer": <table to store output of aggregate data filtering>,
     "charts": {},
	 "style": {},
     "infoj": []
 }
```

Each layer object needs `"table"` or `"arrayZoom"` property defined in order to access the source table.

```javascript
"table": <table name>
```
`"arrayZoom"` is an object that groups tables assigned to respective zoom levels. This was designed for hierarchy datasets which are subject to geographic generalization.

```javascript
"arrayZoom": {
	"10": <source table for zoom level 10>,
	"11": <source table for zoom level 11>,
	"12": <source table for zoom level 12 and higher>,
}
```

Types of layers currently supported:

* ### cluster

A `cluster` layer is a GeoJSON point layer which automatically clusters based on defined value. The layer can be set as editable. Thematic classification can be applied in categorized or graduated styling.

`cluster` layer further takes the following parameters:

__Editing parameters__
```javascript
"editable": <true, "geometry", defaults to false>,
"log_table": <log table name defaults to undefined>
```
`"editable": true` allows editing feature attributes.

`"editable": "geometry"` allows editing geometries.

`"log_table"` is a reference to a table that stores edit logs. This table has the same structure as layer source table and stores each change made to a feature along with last update timestamp and username who made the change.

__Clustering parameters__

Cluster layer recognizes the following `style` parameters:
```javascript
"style": {
	"cluster_label": <field used as label for a single feature>,
  "cluster_cat": <field with clustering property>,
  "cluster_kmeans": <numeric, minimum number of clusters, defaults to 100>,
  "cluster_dbscan": <numeric, maximum distance between locations in cluster (DBScan), defaults  to 0.01>,
	"themes": [] // container for thematic styling
}
```

__Styling__

Cluster style supports custom marker and marker size. Markers can be created with `svg_symbols` module or defined as *svg data URL*.

```javascript
"markerMin": <numeric, smallest marker size, defaults to 20>,
"markerMax": <numeric, largest marker size, defaults to 40>,
"marker": <svg_module string input or dataURL>, // default marker for single feature
"markerMulti": <array with pairs radius and hex colour, input for svg_module> // markerMulti is a cluster of features
```
__Theme__

In order to display classified clusters `themes` parameters within layer style must be defined. `themes` is an array of theme objects. Currently there are 2 supported classification types: categorized and graduated.
Cluster layer supports theme object with the following parameters:

```javascript
"themes": [
  {
    "label": "<theme title to display>",
    "field": "<column name to classify against>",
	  "type": "<categorized (based on string), graduated (based on number)>",
	  "other": "<boolean, defaults to false, if set true layer includes unclassified features>"
	  "applied": "<boolean, if set to true the theme is applied initially>",
	  "cat": {},
	  "competitors": {}
  },
  {...}
]
```

`"cat"` is a container for thematic categories. Features are classified and styled by categories (categorized) or numeric values (graduated) defined inside the  `"cat"` object.

```javascript
// configuration for categorized clusters
"cat": {
	"value 1": {
		"marker": "SVG data URL, array of radius between 0 and 400 and a hex colour or svg_symbols module declaration",
		"label": "label for value 1"
	},
	"value 2": {
		"marker": "svg_symbols.target([400, '#2274A5'])", // example value using svg_symbol.target() function
		"label": "label for value 2"
	},
	{...}
}

// configuration for graduated clusters
"cat": [
	{
		"val": 10,
		"marker": "hex colour, array of radius between 0 and 400 and hex colour, SVG data URL or svg_symbols.target()",,
		"label": "label for value 10"
	},
	{
		"val": 20,
		"marker": "svg_symbols.target([400,'#fcfdbf'])",
    "label": "label for value 20"
	}
]
```

`"competitors"` is a container for competitors configuration. If competitors are defined,`markerMulti` will indicate share of each competitor within a cluster based on `"field"` defined in the parent theme object. Size of rings in the marker show share of each competitor group.

```javascript
"competitors": {
	"value 1": {
		"colour": "<hex colour>",
		"label": "label for value 1"
	},
	"value 2": {
		"colour": "<hex colour>",
		"label": "label for value 2"
	},
	{...}
}
```

#### mvt

#### grid
#### geojson

* ### infoj

`"infoj"` is a container for data associated with each feature displayed on selection and interaction that requires reading feature properties. This is an array of objects with the following structure:

```javascript
"infoj": [
  {
    "field": <field name>,
    "label": <label for the field>, // optional
    "type": <currently supported: "text", "numeric", "integer", "date">,
    "level": <small integer, defines row indent, defaults to 0>,
    "filter": <filter type>,
    "options": <array of drop down values for editable properties>,
    "inline": <boolean, displays table row in one line, defaults to false>
  },
  {
    "label": <set label only when needed a section title>
  },
  {
    "chart": <chart name> // in order to add chart
  },
  {...}
]
```
`"options"` parameter can also support hierarchy of selections:

```javascript
"options": [
  "parent value 1;child value 1 for value 1;child value 2 for value 1",
  "parent value 2;child value 1 for value 2;child value 1 for value 2",
  (...)
]
```

First value before semicolon will determine subsequent choice.

__Filtering__

In order to enable filtering data `"filter"` property in an `"infoj"` item must be defined. The following filter types are supported by cluster and geojson layers:

`"like"` - search for text pattern

`"match"` - search for exact text match

`"date"` - date filtering, later and earlier than

`"numeric"` - number filtering, greater and less than

Filtering by checkbox:
```javascript
"filter": {
      "in": [<array of values>]
  }
  ```


#### tiles

`tiles` layer is a base map layer used both for map tiles and label tiles. It usually requires tile provider attribution. `URI` is base url for request from tile provider. Below default xyz configuration for base map provided by <a href="https://www.mapbox.com/" target="_blank">Mapbox</a>:

```json
"base": {
          "display": true,
          "name": "Mapbox Baselayer",
          "attribution": ["mapbox","osm"],
          "pane": [
            "base",
            500
          ],
          "format": "tiles",
          "URI": "https://api.mapbox.com/styles/v1/style_name/tiles/256/{z}/{x}/{y}?",
          "provider": "MAPBOX"
        }
```

Another base map provider available out of the box is <a href="https://www.here.com/en" target="_blank">Here</a>. This configuration also applies to labels displayed as tiles alongside base map tiles.



## Server

[server.js](https://github.com/GEOLYTIX/xyz/blob/master/server.js) starts an [Fastify](https://www.fastify.io) web server on the specified port.

The startup procedure is as follows.

1. Declare the Fastify server object.

2. Register the Fastify Helmet module.

3. Register the Fastify Formbody module.

4. Register the Fastify Static module.

5. Register the Fastify Cookie module.

6. Register the Fastify Auth module.

7. Register the Fastify JWT module.

8. Decorate routes with the authToken function.

9. Setting [globals](https://github.com/GEOLYTIX/xyz/blob/master/globals.js) from environment settings.

10. Register [workspace](https://github.com/GEOLYTIX/xyz/blob/master/workspace.js) admin routes.

11. Load the admin workspace configuration into the global scope.

12. Remove admin workspace configuration for private access.

13. Remove private workspace confirguration for public access.

14. Load value array for SQL Injection and access lookup.

15. Register [auth](https://github.com/GEOLYTIX/xyz/blob/master/auth.js) routes.

16. Register all other [routes](https://github.com/GEOLYTIX/xyz/blob/master/routes.js).

17. Listen to incoming requests.

## Client Application

The root route will check whether the incoming requests come from a mobile platform using the [mobile-detect](https://github.com/hgoebl/mobile-detect.js) node module. The user and session token are decoded for the access key to the workspace configuration. Based on the user, session and configuration [JSRender assembles](http://www.jsviews.com/#jsr-node-quickstart) the website template ([desktop](https://github.com/GEOLYTIX/xyz/blob/master/views/desktop.html) or [mobile](https://github.com/GEOLYTIX/xyz/blob/master/views/mobile.html)) with the script bundle and workspace configuration.

The application consits of two containers. The control container which is on the left (desktop) or a slider at the bottom (mobile) and the map container.

The control container has a section for layers and (selected) locations. Layers and locations are displayed as expandable drawers. The map container holds attribution as well as the main interface buttons (zoom, access, locate, gazetteer, report).

The gazetteer input is displayed at the top of the control container (desktop) or at the top of the map container (mobile).

[xyz_entry](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.js) is the entry point in the script bundle.

The client application initialisation flow is as follows:

1. Require utils and svg_symbols.

2. Process workspace configuration.

3. Apply browser interface (mobile / desktop) methods.

4. Initialize hooks.

5. Initialize locales.

6. Initialise Leaflet map.

7. Set map view.

8. Declare zoom functions.

9. Declare map view state functions.

10. Initialise layers module.

11. Initialise locations module.

12. Initialise gazetteer module.

13. Initialise locate module.

14. Initialise report module.

We use (flowmaker) to generate a diagram of the [entry flow](https://github.com/GEOLYTIX/xyz/blob/dev/public/js/xyz_entry.svg).

## Routes

### /

The main route which serves a client application.

### /documentation

Serves the [documentation for the client application](https://github.com/GEOLYTIX/xyz/blob/master/public/documentation.md) as github flavoured markdown.

### /proxy/image

Proxy requests for image ressources such as Mapbox tiles or Google Streetview images. The provider parameter is replaced with a key value from the environment settings.

### /api/mvt/get/:z/:x/:y

Request vector tiles from a PostGIS data source.

Query parameter:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* geom_3857: The name of the geometry field in the data table. SRID must be EPSG:3857. Defaults to 'geom_3857'.
* qID: The ID field which is required to select locations from layer. Defaults to null.
* properties: Comma seperated list of field names which are available to the leaflet.vectorGrid plugin for styling. Defaults to empty.
* layer: The name of the layer.
* tilecache: The name of a table used to cache vector tiles. Defaults to false.
* token: The user token which is required to authenticate the route.

### /api/grid/get

Request hex grid as json.

Query parameter:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* geom: The name of the geometry field in the data table. SRID must be EPSG:4326. Defaults to 'geom'.
* qID: The ID field which is required to select locations from layer. Defaults to null.
* size: The property for the size styling of grid cells.
* color: The property for the colour styling of grid cells.
* west: The western bounds for the request (float).
* south: The southern bounds for the request (float).
* east: The eastern bounds for the request (float).
* north: The northern bounds for the request (float).

### /api/geojson/get

Request geojson from PostGIS table within bounding box.

Query parameter:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* geom: The name of the geometry field in the data table. SRID must be EPSG:4326. Defaults to 'geom'.
* geomj: The geojson geometry to be returned from the data table. Must be geojson with EPSG:4326. Defaults to 'ST_asGeoJson(${geom})'.
* properties: Comma seperated list of field names which are available to the leaflet.vectorGrid plugin for styling. Defaults to empty.
* west: The western bounds for the request (float).
* south: The southern bounds for the request (float).
* east: The eastern bounds for the request (float).
* north: The northern bounds for the request (float).

### /api/cluster/get

Request cluster as json from PostGIS table within bounding box.

Query parameter:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* cat: The name of the field which is used to group cluster.
* theme: A theme which is applied to the clustering ('categorized' or 'graduated').
* filter: A json object which will be used to create an SQL filter to be applied before features are read for clustering.
* kmeans: An integer value which defined the minimum number of cluster to be created.
* dbscan: A float value which will be applied to define the maximum distance within a cluster.
* west: The western bounds for the request (float).
* south: The southern bounds for the request (float).
* east: The eastern bounds for the request (float).
* north: The northern bounds for the request (float).

### /api/cluster/select

Request array of location from a cluster.

Query parameter:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* qID: The ID field which is required to select individual locations from cluster. Defaults to 'id'.
* geom: The name of the geometry field in the data table. SRID must be EPSG:4326. Defaults to 'geom'.
* label: The name of the field which returns the list values for locations in cluster. Defaults to '${qID}'.
* filter: A json object which will be used to create an SQL filter to be applied in the query.
* count: The number of items to be listed in the array.
* lnglat: Array of longitude and latitude from where to query the nearest count cluster features.

### /api/location/select

Request location data from a PostgreSQL table by ID.

Post request body:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* qID: The ID field which is required to select individual locations from cluster. Defaults to 'id'.
* id: The ID of the location.
* geom: The geometry field of the location. Only used in the geomj definition. Defaults to 'geom'.
* geomj: The geojson geometry to be returned from the data table. Must be geojson with EPSG:4326. Defaults to 'ST_asGeoJson(${geom})'.
* geomq: Query geometry which is required for spatial lookups.
* geomdisplay: Additional geometry to be displayed with the location.
* sql_filter: Field name for stored SQL lookup filter.
* infoj: The infoj object describes the structured property data to be queried and returned for the location.

### /api/location/new

Creates a new location record in database.

Post request body:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* qID: The ID field which is required to select individual locations from cluster. Defaults to 'id'.
* id: The ID of the location.
* geom: The name of the geometry field. Defaults to 'geom'.
* geometry: The geometry of the new location provided as stringified geojson.
* log_table: The name of a table to store changes.

### /api/location/update

Updates a location in the database.

Post request body:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* qID: The ID field which is required to select individual locations from cluster. Defaults to 'id'.
* id: The ID of the location.
* geom: The name of the geometry field. Defaults to 'geom'.
* geometry: The geometry of the updated location provided as stringified geojson.
* log_table: The name of a table to store changes.

### /api/location/delete

Delete a location record in the database.

Post request body:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* qID: The ID field which is required to select individual locations from cluster. Defaults to 'id'.
* id: The ID of the location.
* log_table: The name of a table to store changes.

### /api/location/aggregate

Creates an aggreagte location in the database.

Post request body:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table_source: The table name from where to aggregate locations.
* table_target: The table name where to store the aggregate location.
* qID: ?
* geom_source: The geometry field of the source table.
* geom_target: The geometry field of the target table.
* filter: A json object which generates the filter to be applied for the aggregation.

### /api/gazetteer/autocomplete



### /api/gazetteer/googleplaces



### /api/catchments

Request array of location from a cluster.

Query parameter:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table_target: The table name to store the catchment areas.
* geom_target: The geometry field in the target table. Defaults to 'geom'.
* qID: ?
* lng: The longitude for the catchment origin.
* lat: The latitude for the catchment origin.
* distance: The distance in seconds to be applied for the catchments.
* detail: The detail level for the catchment calculation.
* reach: The reach of the catchments.
* mode: The travel mode for the catchment calculation.
* provider: The provider to use for the catchment calculation.

### /api/images/new

Uploads an image to cloudinary and attaches the image reference to a location.

Post request body:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name of the location.
* qID: The id field of the location. Defaults to 'id'.
* id: The id of the location.
* The image data itself is send as an octet stream in the payload.

### /api/images/delete

Removes the reference of an image from a location.

Query parameter:
* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name of the location.
* qID: The id field of the location. Defaults to 'id'.
* id: The id of the location.

## SQL Injections

All queries to the PostgreSQL database are parsed through the node-postgres module. [Queries](https://node-postgres.com/features/queries) use a battle-tested parameter substitution code.

Additionally all field and table names are checked against a lookup table which includes values from the current application settings only. A query to a table or a query with a fieldname which is not defined in the application settings is not acceptable ([http code 406](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/406)).

## [Security](#security)

We are using the [fastify-auth](https://github.com/fastify/fastify-auth) module for authentication in XYZ. All authentication is handled in XYZ's [auth.js](https://github.com/GEOLYTIX/xyz/blob/master/auth.js) module.

By default the framework is public with full access to all data sources defined in the environmental settings.

By setting the access key (PUBLIC or PRIVATE) in the environmental settings with a PostgreSQL connection string (plus a table name seperated by a | pipe) it is possible to restrict access. The access control list (ACL) table must be stored in a PostgreSQL database.

If set to PRIVATE a login is required to open the application or access any endpoint. If set to public login is optional for routes which are not restricted for administrator. Admin routes are not available if no ACL is provided. Without the admin route all changes to the settings need to be done in the code repository or database.

An ACL must have following table schema:

```
create table if not exists acl
(
	"_id" serial not null,
	email text not null,
	password text not null,
	verified boolean,
	approved boolean,
	admin boolean,
	verificationtoken text,
	approvaltoken text,
	failedattempts integer default 0
);
```
We are using a javascript implementation of the OpenBDS [Blowfish (cipher)](https://en.wikipedia.org/wiki/Blowfish_(cipher)) to encrypt passwords at rest in the ACL.
The [login](https://github.com/GEOLYTIX/xyz/blob/master/views/login.html) and [register](https://github.com/GEOLYTIX/xyz/blob/master/views/register.html) views use [input form validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#Validation) for the email (max 50 character) and password (min 8 character). These are also validated on the backend.

### Registration

New accounts consist of an email address and password.

Once a record for the account is stored in the ACL an email with a link that contains a verification token is sent. The account holder of the email account must follow this link to verify that access rights to the email account are given.

Once the account is **verified** an email is sent to all site administrators. The email provides a link with the newly generated approval token for the verified user record in the ACL. The account will be **approved** if an administrator validates the link. Login credentials will have to be provided by the administrator if not already logged in (valid JWT cookie).

*It is possible to create user accounts which are not email addresses. These accounts must be verified by an administrator.*

An email will be sent to inform whether an account has been deleted or approved.

### Email transport

We use [SMTPS](https://en.wikipedia.org/wiki/SMTPS) to enable the application to send emails through the [node-mailer](https://nodemailer.com) module. For this to work an SMTPS protocol string must be defined in the TRANSPORT key in the environment settings.

### Password reset

Password reset works the same way as the registration. The hashed password is overwritten in the ACL and account verification is removed. A new verification token is sent to the user. The account will be verified again with the new password once the account holder ascertains access to the email account by following the link containing the verification token. *Administrator do **not** need to approve the account again.* Changing the password resets failed login attempts to 0.

### Failed login attempts

Failed login attempts are stored with the record in the ACL. The verification will be removed once a maximum number of failed attempts has been recorded. The maximum number for failed login attempts can be set in the FAILED_ATTEMPTS environment setting. The default is 3 attempts. Having the verification removed, an account holder is forced to re-register. Setting a new (or old) password in the registration form for an existing account will reset the failed attempts and generate a new verification token to be sent via email. After verifying the account the user is able to login once again.

### JWT token

[JSON Web Token (JWT)](https://jwt.io) are used to store session and user data. Token themselves will be held in a cookie on the browser. The backend will *not* store these cookies in order to horizontally scale the application in a serverless environment.

The **user cookie** stores the email address as well as user access priviliges (verified, approved, admin).

The **session cookie** holds a redirect address which allows the application to return to a specific parameterized address from the login view. This allows the auth module to respond with a redirect instead of passing the original request to the login function.

### Strategy

*fastify-auth* does not provide an authentication strategy. The strategy which is applied by the authToken() function will be detailed in this section.

Requests will be passed on if the authentication succeeds. A redirect to the login will be sent if the authentication fails. A fail message will be assigned to the status field in the user token. A [401 http code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) will be assigned to the response of a requests which fails to authenticate. Redirection can be surpressed with the *noredirect* parameter on the request. This allows for API calls from the client application to not receive a redirect response but only a fail message. The application interface will be masked if a request fails to authenticate.

The individual steps in the authentication strategy sequence are as follows.

1. **no login**

   Success. An anonymous user token and empty session token will be signed and sent to the client if no login is required.

2. **decode token**

   If exists a user token will be decoded from the request cookie or request parameter (in case the request is generated without the capabilitity to assign cookies).

3. **no token**

   Fail. *No user token found in request.* Authentication will fail if no decoded token exists at this stage. An anonymous user token and a session token with the request URL as redirect will be signed to the response.

4. **token timeout**

   Fail. *Session timeout.* The time from when the token was issued at (iat) is compared to the current time to establish the token's age. The authentication will fail if the token's age exceeds the timeout limit.

5. **no admin**

   Fail. *Admin authorization required for the requested route.* This stage is only checked for requests to endpoints which require admin level authorization. Authorization will fail if the user token does not carry admin privileges.

6. **no email**

   Fail. *Email not defined in token.* Authorization will fail at this stage if the user token does not carry an email field in the payload.

7. **user not verified**

   Fail. *User email not verified.* Authorization will fail if the user token does not carry information that the account email has been verified.

8. **user not approved**

   Fail. *User email not approved by administrator.* Authorization will fail at this stage if the user token does not carry the *approved* field.

9. **issue new token**

   Success. Authorization has completed and the user token's issue at value (iat) is updated with the current time, signed to the response, and finally passed on to the *done()* callback.

### Timeout

The default timeout value is 30 (seconds). A different value can be provided in the TIMEOUT environment setting.

### Logout

The user and session token will be emptied by following the /logout route.
