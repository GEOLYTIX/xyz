# Developing

## Setting up development environment

You will start by
[forking](https://github.com/GEOLYTIX/xyz/fork) the XYZ repository.

### Development dependencies

The minimum requirements are:

* Git
* [Node.js](https://nodejs.org/) (version 18 and above)

The executables `git` and `node` should be in your `PATH`.

To install the Node.js dependencies run

    $ npm install

Please check the full list of dependencies as defined in the [package.json](https://github.com/GEOLYTIX/xyz/blob/main/package.json)

## Building the MAPP library

The MAPP and MAPP.UI library must be build with [esbuild](https://esbuild.github.io/) prior to launching the host.

    $ npm run _build

[Express.js](https://expressjs.com/) will be installed by npm as a development dependency. You can run a zero config instance by loading the express.js script in your node runtime.

    $ node express.js

The default port is 3000. You can access the mapp interface on <http://localhost:3000/> in your browser.

Please refer to the [Getting Started](https://github.com/GEOLYTIX/xyz/wiki/Getting-started) wiki page for the next steps in regards to workspace configuration and environment variables.