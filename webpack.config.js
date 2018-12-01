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
  // stats: {
  //   optimizationBailout: true,
  //   maxModules: Infinity
  // }
};