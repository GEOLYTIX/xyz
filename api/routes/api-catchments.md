# /api/catchments

Request array of location from a cluster.

Query parameter:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table\_target: The table name to store the catchment areas.
* geom\_target: The geometry field in the target table. Defaults to 'geom'.
* qID: ?
* lng: The longitude for the catchment origin.
* lat: The latitude for the catchment origin.
* distance: The distance in seconds to be applied for the catchments.
* detail: The detail level for the catchment calculation.
* reach: The reach of the catchments.
* mode: The travel mode for the catchment calculation.
* provider: The provider to use for the catchment calculation.



