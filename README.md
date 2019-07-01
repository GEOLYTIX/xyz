**v1.6.1**

# xyz

**An open source javascript framework for spatial data and application interfaces.**

At its core XYZ is a collection of RESTful endpoints which provide secure interfaces to spatial data sources. These endpoints are routed through the middleware with Fastify, a low overhead web framework for Node.js. In a serverless architecture, XYZ will be deployed as a function to a node runtime.

Spatial data must be stored in a cloud accessible PostGIS (v2.4+) database, allowing XYZ middleware handler to compose SQL statements that query, transform and aggregate geometries. The use of standards such as [GeoJSON](https://tools.ietf.org/html/rfc7946) and Mapbox Vector Tiles ([MVT](https://docs.mapbox.com/vector-tiles/specification/)) allow for the cartographic presentation of spatial data with common web mapping engines. No additional services such as Geoserver or Mapserver are required.

### Application Views

Leaflet and Openlayers are bundled with a collection of common utilities in XYZ' control libraries. These libraries allow for the design of views which implement interactive map controls to meet diverse client requirements. Application views consist of a combination of markup, stylesheets and scripts which wire interface elements to the data backend through the XYZ middleware.

Views are dashboards which may integrate a range of control elements such as maps, info panels, lists, graphs and tables.

[The XYZ user guide outlines the functionality of the default views which are accessible through the root endoint.](https://geolytix.github.io/docs/developer_docs/introduction/)

Custom views can be integrated either with the repository itself or hosted with other ressources in a seperate CDN.

The design process for views is aimed at frontend developers. Interfaces maybe developed with HTML/CSS/JS. The control library provide some vanilla DOM elements which maybe extended for use in custom views. hyperHTML is used to generate virtual DOM on the client side.

[The XYZ developer guide provides detailed reference of all API endpoints and methods.](https://geolytix.github.io/docs/developer_docs/introduction/)

### Environment Settings & Workspaces

Environment settings contain sensitive information such as connection strings for data sources, security information and API keys.

Workspaces define the layers and locations to be loaded by the API and application views.

[The XYZ administrator guide provides detailed reference of all configurations and tested deployment platforms.](https://geolytix.github.io/docs/developer_docs/introduction/)

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

### Proxy for 3rd party services

The XYZ middle may consume 3rd party services such as Google Geocode or Mapbox Drivetime isochrones.


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