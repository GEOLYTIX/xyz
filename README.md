**v5.1.0**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Unit Tests](https://github.com/GEOLYTIX/xyz/actions/workflows/unit_tests.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=GEOLYTIX_xyz&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=GEOLYTIX_xyz)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

**Open source presentation, controller, domain, and service layers for cloud native spatial data and application interfaces.**

[![OSGeo Community Project](https://www.osgeo.org/wp-content/themes/roots/assets/img/badge-community-project.png)](https://www.osgeo.org/projects/xyz-mapp/)

## Turbo Monorepo
Since v5 this repository is structured as a Turbo monorepo which provides shared dependencies for several apps. Server apps can be provided to expand the XYZ API routes. Apps may also provide custom authentication layers.

## XYZ

**XYZ** is the Node.js **domain and service layer**: an [Express](https://expressjs.com) API which provides secure gateways to spatial data sources and 3rd party service providers.

The domain layer routes API requests, serves the application views and the bundled client libraries, and caches the workspace.

The service layer authenticates users and runs query templates. Requests from the MAPP client never carry SQL. They name a query template and send parameters, which are assigned to the template and passed to the data source layer. The rows are returned to the client.

The data source layer uses the non-blocking [node-postgres](https://github.com/brianc/node-postgres) library to query PostGIS-enabled PostgreSQL databases. Each `DBS_*` connection in the environment is a separate data source. Signers and providers give access to cloud resources such as S3 and Cloudfront.

User accounts and their roles are stored in an Access Control List (ACL) table in PostgreSQL. Host apps can extend XYZ with their own routes or login providers, eg. SAML, without forking the repository.

See [XYZ API](./knowledge/architecture/xyz-api.md) in the knowledge bundle.

## Workspace

The workspace ties XYZ and MAPP together. It is a JSON document that declares the locales, layers, query templates, location entries, themes and editing features of an instance. Locales and layers are built from templates, and their data may be held in different databases or systems.

The workspace is also where access is controlled. The XYZ API composes the workspace separately for each user. Roles and template scopes decide which locales, layers and templates are merged for that user. Role filters restrict rows. Roles on location entries restrict fields. Role-specific configuration adds themes, entries or editing for some users only. Anything a user's roles do not allow is removed on the server before the response is sent. MAPP only receives the objects the user may access, and can only run their query templates.

Fine-grained authorization is therefore defined once, in the workspace, for all connected data sources. See [fine-grained authorization](./knowledge/security/fine-grained-authorization.md) in the knowledge bundle.

## MAPP

**Application control and presentation layers** are provided as JavaScript ES module libraries.

**MAPP** uses [OpenLayers](https://openlayers.org) for mapviews and provides an interface to the XYZ API. The library hides the complexities of handling spatial data objects such as layers and locations. A view can create several mapviews.

**MAPP.UI** builds user interfaces around mapviews. Application views can be dashboards made up of multiple data views such as maps, tables, lists or charts.

Plugins extend or replace MAPP methods at runtime, without forking the repository. A locale loads them by dynamic import, and they can bring their own third party modules, eg. [Tabulator](https://github.com/olifolkerd/tabulator) or [Chart.js](https://github.com/chartjs/Chart.js). Shared plugins are published in [GEOLYTIX/mapp/plugins](https://github.com/GEOLYTIX/mapp/tree/main/plugins); see [plugins](./knowledge/plugins/index.md) in the knowledge bundle.

XYZ serves the MAPP and MAPP.UI bundles from `public/js/lib`. The bundles are built with Vite. They are committed to `main` and the release tags only, so a release can be deployed without a build. Sites outside XYZ can use the [@geolytix/mapp](./knowledge/architecture/mapp-package.md) npm package.

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
