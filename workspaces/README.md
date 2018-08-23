# Workspaces

  
A workspace is the configuration of services, locales, layers and locations.

A service is a plugin which is accessible from the application root. For example the ability to locate a device position on the map or exporting the current view as a report are services.

Layers are grouped into locales. A locale is defined by their extent \(bounds and zoom level\). A locale may have services itself. For example the gazetteer service which is defined for a locale. Only one locale can be active in the application view. All API calls must specify a locale \(as well as a layer\). Layers can be grouped.

Vector layer are comprised of locations \(point or polygon\). A location is defined by an InfoJ object which list the locations properties and defines services specific to a location \(e.g. Google Streetview\). Properties can be grouped within the InfoJ object.

A workspace can be stored in the repository or in a PostgreSQL table.

locale File based configuration are stored in the [/workspaces](https://github.com/GEOLYTIX/xyz/tree/master/workspaces) directory. It is recommended to store the configuration object in a database in order manage the configurastion through admin views.

/admin/workspace

A [jsoneditor](https://github.com/josdejong/jsoneditor) tree view which allows modification of config keys, uploading configuration files into the view and saving the workspace configuragtion to a PostgreSQL table.

/admin/workspacejson

A code view \(json\) of the configuration object.

Below is a list of config keys which are currently supported. Default minimum viable settings will be set if no _workspace_ has been defined in the deployment environment.

`"title": "XYZ Demo"`

The application title which will be inserted into the title meta tag in the HTML template.

`"locate": {}`

Whether the geolocator should be enabled.

`"documentation": "documentation"`

Whether a documentation button should be enabled. If set to 'documentation' the [documentation.md](https://github.com/GEOLYTIX/xyz/tree/dev/public/documentation.md) markhub will be displayed in a github flavoured view. Any suitable link can be set instead of 'documentation'.

`"locale": "UK"`

The default locale which is opened and set to the url hook parameter when an application is accessed. Defaults to the first locale in the locales object.

