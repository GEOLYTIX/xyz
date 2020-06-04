const path = require('path');

const webpack = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');

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
    concatenateModules: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 8
        }
      })
    ]
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