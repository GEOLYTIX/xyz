const path = require('path');
// const webpack = require('webpack');

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
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     d3: 'd3'
  //   })
  // ],
  optimization: {
    concatenateModules: true
  },
  stats: {
    maxModules: Infinity,
    optimizationBailout: true
  }
};