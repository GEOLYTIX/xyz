# /api/cluster/select

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

