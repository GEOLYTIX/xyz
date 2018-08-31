# /api/location/delete

Delete a location record in the database.

Post request body:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* qID: The ID field which is required to select individual locations from cluster. Defaults to 'id'.
* id: The ID of the location.
* log\_table: The name of a table to store changes.

