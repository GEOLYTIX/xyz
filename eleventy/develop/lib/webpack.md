---
title: Webpack
tags: [develop]
layout: root.html
---

# Bundling the control library

The library code split into multiple ES6 modules is stored in the [/lib](https://github.com/GEOLYTIX/xyz/tree/master/lib) directory of the XYZ repo. The application is bundled with [Webpack 4](https://webpack.js.org).

The [package.json](https://github.com/GEOLYTIX/xyz/blob/master/package.json) stores mutliple scripts to build the control library as [xyz_openlayers.js](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_openlayers.js) in the /public/js directory.

`npm run dev` will be build a development library which is not size optimised. The compilation to dev is fastest.

`npm run build` will bundle a production library which is commited to the XYZ repository.

The [webpack.config](https://github.com/GEOLYTIX/xyz/blob/master/webpack.config.js) provides following configuration for the compilation process. The entry point for the bundle is the index.mjs module script in the /lib directory.

```javascript
const path = require('path');

const webpack = require('webpack');

module.exports = {
  entry: {
    xyz_openlayers: ['./lib/index.mjs']
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].js',
    // library: 'xyz',
    // libraryTarget: 'amd-require'

  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/
    }]
  },
  optimization: {
    concatenateModules: true
  },
  externals: {
    moment: 'moment'
  },
  plugins: [
    new webpack.DefinePlugin({
        XYZ_VERSION: JSON.stringify(require('./package.json').version)
    })
  ]
  //stats: 'verbose'
  // stats: {
  //   optimizationBailout: true,
  //   maxModules: Infinity
  // }
};
```