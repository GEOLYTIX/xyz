# /api/geojson/get

Request geojson from PostGIS table within bounding box.

Query parameter:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* geom: The name of the geometry field in the data table. SRID must be EPSG:4326. Defaults to 'geom'.
* geomj: The geojson geometry to be returned from the data table. Must be geojson with EPSG:4326. Defaults to 'ST\_asGeoJson\(${geom}\)'.
* properties: Comma seperated list of field names which are available to the leaflet.vectorGrid plugin for styling. Defaults to empty.
* west: The western bounds for the request \(float\).
* south: The southern bounds for the request \(float\).
* east: The eastern bounds for the request \(float\).
* north: The northern bounds for the request \(float\).

