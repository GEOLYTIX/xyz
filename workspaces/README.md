# Workspaces

A workspace is the configuration of services, locales, layers and locations.

A [service]() is a plugin which is accessible from the application root. e.g. The ability to [locate](locate.md) a device position on the map or exporting the current view of layers and locations as a [report](report.md).

[Layers](locales/layers.md) are defined within [locales](locales/). A locale is defined by its extent \(bounds and zoom level\). A locale may have services itself. e.g. The [gazetteer](locales/gazetteer.md) geolocation service.

Locations are defined by an [InfoJ](locales/infoj/) schema on the layer through which a location can be accessed.

The location of a workspace is defined in the [environment settings](../environment-settings.md). Only one workspace can be served by a XYZ instance.

\*\*\*\*[**/admin/workspace**](../api/routes/admin-workspace.md)\*\*\*\*

A [jsoneditor](https://github.com/josdejong/jsoneditor) tree view which allows administrator to modify workspaces which are stored in a PostgreSQL table.

![jsoneditor tree view](../.gitbook/assets/image%20%282%29.png)

\*\*\*\*[**/admin/workspacejson**](../api/routes/admin-workspacejson.md)\*\*\*\*

A [jsoneditor](https://github.com/josdejong/jsoneditor) code view which allows administrator to modify workspaces which are stored in a PostgreSQL table.

![json editor code view](../.gitbook/assets/image%20%283%29.png)



