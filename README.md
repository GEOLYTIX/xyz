**v4.2.0**

**Open source presentation, controller, domain and service layers for cloud native spatial data and application interfaces.**

## XYZ

The pattern for the Node.js **domain and service layer** are that of a RESTful API which provides secure gateways for spatial data sources and 3rd party service providers. The domain layer handles API routing, rewrites, and ressource caching. The service layer manages authentication and transaction script. URL parameter (and payloads) from the application control layer are assigned to query templates and passed to the data source layer. The response being parsed and returned to the presentation layer. The Node.js application layers may be served by an Express web server or deployed as cloud native serverless functions.

## MAPP

**Application control and presentation layers** are provided as ES6 javscript libraries. **MAPP** utilizes the Openlayers map engine for mapviews and provides an interface to the XYZ API. The library abstracts away the complexities of handling spatial data objects such as layers and locations.

**MAPP.UI** contains utilities to build engaging user interfaces around mapviews. The application views can be dashboards made up of multiple data views such as maps, tables, lists, or graphs.

## Documentation

Please refer to the [wiki pages](https://github.com/GEOLYTIX/xyz/wiki) for detailed interface references.

## Version History

**v1** was build with [Leaflet](https://github.com/Leaflet/Leaflet) as the map render for the client library.

The Mapp library changed the map render to [Openlayers](https://github.com/openlayers/openlayers) in **v2**.

The XYZ API was rebuild to run as serverless functions in **v3**.

**v4** is a complete rewrite of the client libraries. All user interface utilities have been taken out of the mapp library and have been compiled as mapp.ui library. Both libraries are now bundled with [esbuild](https://esbuild.github.io/).

The mapp library is now able to instantiate multiple mapviews.

Polymorphism is applied to extend or modify object types and methods through plugins without the need to fork the repository.

Dynamic module imports reduce the need to bundle 3rd party libraries such as [Tabulator](https://github.com/olifolkerd/tabulator) and [Chart.js](https://github.com/chartjs/Chart.js).

## XYZ Dependencies

Node.js v18+

[bcryptjs](https://www.npmjs.com/package/bcryptjs) - Optimized bcrypt in JavaScript with zero dependencies.

[cloudinary](https://www.npmjs.com/package/cloudinary) - Provides simple, yet comprehensive image and video upload, transformation, optimization, and delivery capabilities.

[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - A Node implementation of JSON Web Token.

[nanoid](https://www.npmjs.com/package/nanoid) - A tiny, secure, URL-friendly, unique string ID generator for JavaScript.

[Node-Postgres](https://github.com/brianc/node-postgres) - PostgreSQL client for Node.

[nodemailer](https://github.com/nodemailer/nodemailer) - Send e-mails with Node – easy as cake!

[aws-sdk](https://github.com/aws/aws-sdk-js-v3) - Several modules are required in order to access resources on cloudfront or S3.

### Development dependencies

Following development dependencies are required to build the library and run a local instance of the XYZ host.

[Express](https://www.npmjs.com/package/express) - Fast, unopinionated, minimalist web framework for Node.

[cookie-parser](https://www.npmjs.com/package/cookie-parser) - Parse cookie header for express.js.

[dotenv](https://www.npmjs.com/package/dotenv) - Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.

[esbuild](https://www.npmjs.com/package/esbuild) - A JavaScript bundler and minifier.

[µhtml](https://github.com/WebReflection/uhtml) - A micro HTML/SVG render which is bundled as utils into the MAPP library.

[SASS](https://www.npmjs.com/package/sass) - A pure JavaScript implementation of Sass.

[eslint](https://www.npmjs.com/package/eslint) - A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.

## Mapp Dependencies

[Openlayers](https://github.com/openlayers/openlayers) - High-performance web mapping engine.

## License

Free use of the code in this repository is allowed through a [MIT license](https://github.com/GEOLYTIX/xyz/blob/master/LICENSE).

## BrowserStack

BrowserStack supports this OpenSource project and provides us with valuable tools to test the Mapp library on different client platforms.