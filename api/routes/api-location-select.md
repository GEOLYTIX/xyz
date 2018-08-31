# /api/location/select

Request location data from a PostgreSQL table by ID.

Post request body:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* qID: The ID field which is required to select individual locations from cluster. Defaults to 'id'.
* id: The ID of the location.
* geom: The geometry field of the location. Only used in the geomj definition. Defaults to 'geom'.
* geomj: The geojson geometry to be returned from the data table. Must be geojson with EPSG:4326. Defaults to 'ST\_asGeoJson\(${geom}\)'.
* geomq: Query geometry which is required for spatial lookups.
* geomdisplay: Additional geometry to be displayed with the location.
* sql\_filter: Field name for stored SQL lookup filter.
* infoj: The infoj object describes the structured property data to be queried and returned for the location.

