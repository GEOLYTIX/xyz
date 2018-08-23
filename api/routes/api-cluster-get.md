# /api/cluster/get

Request cluster as json from PostGIS table within bounding box.

Query parameter:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name.
* cat: The name of the field which is used to group cluster.
* theme: A theme which is applied to the clustering \('categorized' or 'graduated'\).
* filter: A json object which will be used to create an SQL filter to be applied before features are read for clustering.
* kmeans: An integer value which defined the minimum number of cluster to be created.
* dbscan: A float value which will be applied to define the maximum distance within a cluster.
* west: The western bounds for the request \(float\).
* south: The southern bounds for the request \(float\).
* east: The eastern bounds for the request \(float\).
* north: The northern bounds for the request \(float\).

