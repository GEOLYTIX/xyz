# /api/grid/get

Request hex grid as json.

Query parameter:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* geom: The name of the geometry field in the data table. SRID must be EPSG:4326. Defaults to 'geom'.
* qID: The ID field which is required to select locations from layer. Defaults to null.
* size: The property for the size styling of grid cells.
* color: The property for the colour styling of grid cells.
* west: The western bounds for the request \(float\).
* south: The southern bounds for the request \(float\).
* east: The eastern bounds for the request \(float\).
* north: The northern bounds for the request \(float\).

