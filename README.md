**v5.1.0**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Unit Tests](https://github.com/GEOLYTIX/xyz/actions/workflows/unit_tests.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=GEOLYTIX_xyz&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=GEOLYTIX_xyz)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

**Open source presentation, controller, domain, and service layers for cloud native spatial data and application interfaces.**

[![OSGeo Community Project](https://www.osgeo.org/wp-content/themes/roots/assets/img/badge-community-project.png)](https://www.osgeo.org/projects/xyz-mapp/)

## Turbo Monorepo
Since v5 this repository is structured as a Turbo monorepo which provides shared dependencies for several apps. Server apps can be provided to expand the XYZ API routes. Apps may also provide custom authentication layers.

## Workspace

The workspace is the core of XYZ. It is a JSON document that declares the locales, layers, query templates, location entries, themes and editing features of an instance. Locales and layers are built from templates, and their data may be held in different databases or systems.

The workspace is also where access is controlled. The XYZ API composes the workspace separately for each user. Roles and template scopes decide which locales, layers and templates are merged for that user. Role filters restrict rows. Roles on location entries restrict fields. Role-specific configuration adds themes, entries or editing for some users only. Anything a user's roles do not allow is removed on the server before the response is sent. Clients never send SQL; they can only run the query templates of objects the user can access.

Fine-grained authorization is therefore defined once, in the workspace, for all connected data sources. See [fine-grained authorization](./knowledge/security/fine-grained-authorization.md) in the knowledge bundle.

## XYZ

The pattern for the Node.js **domain and service layer** are that of a RESTful API which provides secure gateways for spatial data sources and 3rd party service providers.

The domain layer handles API routing, rewrites, and resource caching.

The service layer manages authentication and transaction script. URL parameter (and payloads) from the application control layer (mapp) are assigned to query templates and passed to the data source (service) layer. The response being parsed and returned to the (mapp) presentation layer.

The data source (service) layer is build on the non blocking [node-postgres](https://github.com/brianc/node-postgres) library to allow access to PostGIS extended relational Postgres databases.

Postgres being able to handle object records allows for the Access Control Lists (ACL) to be stored as Postgres tables.

## MAPP

**Application control and presentation layers** are provided as ES6 javscript libraries. **MAPP** utilizes the openlayers map engine for mapviews and provides an interface to the XYZ API. The library abstracts away the complexities of handling spatial data objects such as layers and locations.

**MAPP.UI** contains utilities to build engaging user interfaces around mapviews. The application views can be dashboards made up of multiple data views such as maps, tables, lists, or graphs.

The MAPP library can be extended at runtime by dynamically importing [mapp plugins](https://github.com/GEOLYTIX/mapp/tree/main/plugins) which may use third party modules.

A bundled MAPP library is provided in the public directory. It is not required to deploy library files and bundle the v5 MAPP library in the XYZ server runtime.

## Documentation

The apps and their dependencies are described in the [monorepo](./knowledge/architecture/monorepo.md) concept.

The [knowledge portal](https://geolytix.github.io/xyz/) documents architecture, environment variables, workspace configuration, views, security and deployment. It is built from the [knowledge bundle](./knowledge/index.md) in this repository; see [DOCUMENTATION.md](./DOCUMENTATION.md).

For repository setup and local development, see [local development](./knowledge/deployment/local-development.md) in the knowledge bundle.

For creating a versioned GitHub release, see [RELEASING.md](./RELEASING.md).

For Vercel and self-hosted deployment workflows, see [DEPLOYMENT.md](./DEPLOYMENT.md).

For environment validation, vanilla Varlock examples, and frozen Vercel deployments, see [varlock/README.md](./varlock/README.md).

## License

Free use of the code in this repository is allowed through a [MIT license](https://github.com/GEOLYTIX/xyz/blob/master/LICENSE).

## BrowserStack

BrowserStack supports this OpenSource project and provides us with valuable tools to test the Mapp library on different client platforms.
