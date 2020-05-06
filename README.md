**v3.0.0**

# xyz

**Open source presentation, controller, domain and service layers for spatial data and application interfaces.**

The XYZ stack consists of several application layers.

The pattern for the Node **domain and service layers** are that of a RESTful API which provides secure gateways for spatial data sources and 3rd party service providers. The domain layer handles API routing, rewrites, and ressource caching while the service layer manages authentication and processes transaction script. URL parameter (and payloads) from the application control layer are assigned to query templates and passed to the data source layer. The response from the database connection pool is then parsed into JSON and returned to the presentation layer. The Node application layers may be served by an Express web server or deployed as serverless functions to the cloud.

Spatial data must be stored in a cloud accessible PostGIS database to allow for the creation and caching of vector tiles in the **data source layer**.

**Application control and presentation layers** are provided as an ES6 javscript library. XYZ' client library utilizes the Openlayers mapping engine among other visualisation libraries such as Tabulator and ChartJS to power engaging application views.

Please visit the [XYZ project page](https://geolytix.github.io/xyz/) for in depth articles, code samples, documentation, and developer notes.

### JAMstack Application Views

Application views are dashboards made up of multiple data views such as maps, tables, lists, or graphs. Build with markup and the XYZ control library, application views connect to XYZ hosts. The hosted API is capable of rendering templates and passing queries to the data source layer. Custom script may be added as tags to the DOM. This allows XYZ' application control to dispatch itself as well as functional objects such as layers and locations as event details to the custom script.

Views may be static sites requested from a CDN or server side rendered by the XYZ/views API.

### Templating

XYZ' templating is a process of assigning configuration objects and parameter substitution. Templates may be text (e.g. HTML/SQL) to be rendered by the XYZ host and send as views to the presentation layer or passed as transaction script to the data source layer.

### Environment Settings & Workspaces

Environment settings contain sensitive information such as connection strings for data sources, secrets for the generation of token, and API keys for 3rd party service provider.

The workspace defines which layers, locations, and templates are available to the XYZ API. Transaction script must never be sent directly from the application control layer but needs to be rendered from script and query templates provided by the workspace. Roles may be assigned to the configuration objects in the XYZ workspace.

## Features

### Deployment

The XYZ API may be deployed as an Express web server (used for local debugging). For production we recommended to deploy the XYZ host as serverless functions to Vercell's (former Zeit) Now platform. XYZ' API is designed to fall within the function handler and memory limit which qualify for the [free Hobby plan](https://vercel.com/pricing).

### Github API

Configurations and ressources may either be deployed with the application code from a local repository or stored in Github repositories. [Private repositories are now freely available to everyone](https://github.blog/2020-04-14-github-is-now-free-for-teams/). XYZ workspaces must not contain sensitive information and may therefore be stored in a public repository. A Github API token in the environment settings allows the XYZ host access to private repositories.

### Security

Access to the API can be secured with signed JWT. Token may be provided as URL parameter or with a cookie. User accounts can be stored in a PostgreSQL Access Control List (ACL). Administrative and functional roles can be assigned to registered user accounts. Roles define the level of access to connected data sources. The security strategy also supports the issue of API keys which may be revoked and do not provide access to any sensitive administrative tasks.

### Editing

The XYZ/location API provides the ability to create, delete and update locations on configured PostGIS layers. The application control library provides utilities to digitize geometries in a Openlayers map view. Ressources such as documents and images may be uploaded to Cloudinary with links being sent as properties for a location update query.

### Data aggregation layer

SQL script templates are provided as default for the presentation of clustered data views.

### Dynamic MVT

The XYZ service layer is capable to generate and cache vector tiles in connected PostGIS data sources.

### Proxy for 3rd party services

The domain and service layer may secure proxy access for services provided by Google Maps, Mapbox, MapTiler, Bing, Cludinary, or Here.

## Dependencies

[Openlayers](https://github.com/openlayers/openlayers) - High-performance web mapping engine.

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - A Node implementation of JSON Web Token.

[bcryptjs](https://www.npmjs.com/package/bcryptjs) - Optimized bcrypt in JavaScript with zero dependencies.

[Node-Postgres](https://github.com/brianc/node-postgres) - PostgreSQL client for Node.

[Express](https://www.npmjs.com/package/express) - Fast, unopinionated, minimalist web framework for Node.

[express-http-proxy](https://www.npmjs.com/package/express-http-proxy) - Express middleware to proxy request to another host and pass response back to original caller.

[hyperHTML](https://github.com/WebReflection/hyperHTML) - A Fast & Light Virtual DOM Alternative.

[chart.js](https://github.com/chartjs/Chart.js) - For the creation of HTML canvas charts in info panels and report views.

[tabulator](https://github.com/olifolkerd/tabulator) - Javascript library for interactive tables and data grids.

[flatpickr](https://www.npmjs.com/package/flatpickr) - A customisable JavaScript datetime picker.

[chroma.js](https://github.com/gka/chroma.js) - A JavaScript library for all kinds of color manipulations.

[TurfJS](https://github.com/Turfjs/turf) - A modular geospatial engine for geometry aggregation and transformations in the middleware and on the client side.

[lodash](https://github.com/lodash/lodash) - A modern JavaScript utility library delivering modularity, performance, & extras.

[nodemailer](https://github.com/nodemailer/nodemailer) - Send e-mails with Node – easy as cake!

[node-fetch](https://github.com/bitinn/node-fetch) - A light-weight module that brings window.fetch to Node.

[mobile-detect.js](https://github.com/hgoebl/mobile-detect.js) - Node device detection from request header.


## License

Free use of the code in this repository is allowed through a [MIT license](https://github.com/GEOLYTIX/xyz/blob/master/LICENSE).


## BrowserStack

BrowserStack supports this OpenSource project, providing us with valuable tools to test the XYZ client on different platforms.