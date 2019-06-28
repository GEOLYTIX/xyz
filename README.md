**v1.6.1**

# xyz

**An open source javascript framework for spatial data and application interfaces.**

At its core XYZ is a collection of RESTful endpoints which provide secure interfaces to spatial data sources.

Spatial data must be stored in a cloud accessible PostGIS (v2.4+) database. The XYZ middleware composes SQL statements to query and aggregate PostGIS geometries. The use of standards such as GeoJSON and Mapbox Vector Tiles (MVT) allow for the display of spatial data in web mapping engines such as Leaflet, Openlayers or Mapbox-GL. No additional services such as Geoserver or Mapserver are required.

Leaflet and Openlayers are bundled together with a collection of utilities in XYZ' control libraries. These libraries allow for the design of views to meet diverse client requirements. Application views consist of a combination of markup, stylesheets and scripts which wire interface elements to the data backend through the XYZ middleware. Views are often dashboards which may integrate a range of control elements such as maps, info panels, lists, graphs and tables.

### Application Views

Default views for Desktop and Mobile as well as report views are provided with the XYZ repository.

User guides provide detailed reference for XYZ client interfaces.



Custom views maybe integrated with the repository itself or can be hosted together with other ressources in a seperate CDN.

The design process for views is aimed at frontend developers. Interfaces maybe developed with HTML/CSS/JS. The control library provide some vanilla DOM elements which maybe extended for use in custom views. hyperHTML is used to generate virtual DOM on the client side.

The developer guide provides detailed reference of all API endpoints and methods.

### Environment Settings & Workspaces

Environment settings...

Workspaces control...


## Features

### Deployment

XYZ may be deployed to any node runtime. It is recommended to deploy the node application as a cloud function to a scalable backend as a service (BaaS).

### Security

Access to the API can be secured with JWT keys, stored in an Access Control List (ACL). Administrative and functional roles can be assigned to registered user accounts. Roles define the level of access to linked data sources. XYZ' security strategy also supports the issue of API keys.

### Editing

User may edit geometry, attribute, and model data in connected PostGIS data sources.

### Data aggregation layer

SQL statements composed in the middleware allow the presentation of aggregated data views from large tables on the client side.

### Dynamic MVT

The XYZ middleware is capable to generate and cache vector tiles in connected PostGIS datasources.


## Dependencies

[Openlayers](https://github.com/openlayers/openlayers) - High-performance web mapping engine.

[Leaflet](https://github.com/Leaflet/Leaflet) - Javascript library for interactive web mapping.

[Chart.js](https://github.com/chartjs/Chart.js) - For the creation of HTML canvas charts in info panels and report views.

[TurfJS](https://github.com/Turfjs/turf) - A modular geospatial engine for geometry aggregation and transformations in the middleware and on the client side.

[Tabulator](https://github.com/olifolkerd/tabulator) - Javascript library for interactive tables and data grids.

[Node-Postgres](https://github.com/brianc/node-postgres) - PostgreSQL client for node.js.

[Fastify](https://github.com/fastify/fastify) - Fast and low overhead framework for node.js. [Node - JSON Webtoken](https://github.com/auth0/node-jsonwebtoken) is packaged as a dependency with the [Fastify JWT](https://github.com/fastify/fastify-jwt) plugin.

[hyperHTML](https://github.com/WebReflection/hyperHTML) - A Fast & Light Virtual DOM Alternative.

[JSRender](https://github.com/BorisMoore/jsrender) - A lightweight, powerful and highly extensible templating engine.


## License

Free use of the code in this repository is allowed through a [MIT license](https://github.com/GEOLYTIX/xyz/blob/master/LICENSE).


## BrowserStack

BrowserStack supports this OpenSource project, providing us with valuable tools to test XYZ over different systems and browsers configurations.