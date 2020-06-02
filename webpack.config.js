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