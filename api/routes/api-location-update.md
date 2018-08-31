# /api/location/update

Updates a location in the database.

Post request body:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* qID: The ID field which is required to select individual locations from cluster. Defaults to 'id'.
* id: The ID of the location.
* geom: The name of the geometry field. Defaults to 'geom'.
* geometry: The geometry of the updated location provided as stringified geojson.
* log\_table: The name of a table to store changes.

