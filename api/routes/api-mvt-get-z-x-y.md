# /api/mvt/get/:z/:x/:y

Request vector tiles from a PostGIS data source.

Query parameter:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* geom\_3857: The name of the geometry field in the data table. SRID must be EPSG:3857. Defaults to 'geom\_3857'.
* qID: The ID field which is required to select locations from layer. Defaults to null.
* properties: Comma separated list of field names which are available to the leaflet.vectorGrid plugin for styling. Defaults to empty.
* layer: The name of the layer.
* tilecache: The name of a table used to cache vector tiles. Defaults to false.
* token: The user token which is required to authenticate the route.

