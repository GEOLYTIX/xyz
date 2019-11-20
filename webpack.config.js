const path = require('path');

module.exports = {
  entry: {
    xyz_ui: ['./public/js/xyz_ui.js'],
    xyz_control: ['./public/js/xyz_control/lib.js']
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