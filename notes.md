# 3.1.1

Fix for zero env launch. getWorkspace to get default if no env provided.

Token are removed from all lib request calls. All calls should work with cookies alone.

Container with geometry collection legend to get display: block; otherwise legend displayed inline as flex element.

Fix to geometry checkbox - previously hiding a geometry would also hide geometry collection defined on the same location.

Fix for roles. [#273](https://github.com/GEOLYTIX/xyz/issues/273)

Assign tab to dataviews in array.

Return error message if unable to connect to DBS in query.

Add raw.githubusercontent.com and gitcdn to csp image source.