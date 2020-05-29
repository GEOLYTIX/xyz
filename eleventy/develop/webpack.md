---
title: Webpack
tags: [develop]
layout: root.html

---

The application is bundled with [Webpack 4](https://webpack.js.org).

With the [package.json](https://github.com/GEOLYTIX/xyz/blob/master/package.json) dependencies installed the [xyz entry code](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.js) can be bundled with the `npm run build` command from the root.

```javascript
const path = require('path');

module.exports = {
  entry: {
    xyz: ['./public/js/xyz_entry.js']
  },
  output: {
    path: path.resolve(__dirname, 'public/js/build'),
    filename: '[name]_bundle.js'
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
  stats: {
    maxModules: Infinity,
    optimizationBailout: true
  }
};
```