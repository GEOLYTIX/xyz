# Webpack / Babel

The application is bundled with [Webpack 4](https://webpack.js.org). We use the JavaScript compiler [Babel](https://babeljs.io) with polyfills to target the [ES2015](https://babeljs.io/docs/en/babel-preset-es2015.html) preset environment for compatibility with Internet Explorer 11.

With the [package.json](https://github.com/GEOLYTIX/xyz/blob/master/package.json) dependencies installed the [xyz entry code](https://github.com/GEOLYTIX/xyz/blob/master/public/js/xyz_entry.js) can be bundled with the `npm run build` command from the root.

{% code-tabs %}
{% code-tabs-item title="webpack.config" %}
```javascript
const path = require('path');

module.exports = {
  entry: {
    xyz: ['babel-polyfill', './public/js/xyz_entry.js']
  },
  output: {
    path: path.resolve(__dirname, 'public/js/build'),
    filename: '[name]_bundle.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015']
          }
        }
      }
    ]
  }
};
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% hint style="warning" %}
We currently 'require' CommonJS module. We plan to refactor for [ES6 modules](https://www.contentful.com/blog/2017/04/04/es6-modules-support-lands-in-browsers-is-it-time-to-rethink-bundling) prior to a point release.
{% endhint %}



