# /api/location/aggregate

Creates an aggregate location in the database.

Post request body:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table\_source: The table name from where to aggregate locations.
* table\_target: The table name where to store the aggregate location.
* qID: ?
* geom\_source: The geometry field of the source table.
* geom\_target: The geometry field of the target table.
* filter: A json object which generates the filter to be applied for the aggregation.

