const path = require('path');

const webpack = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    xyz_openlayers: ['./lib/index.mjs']
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    // chunkFilename: '[name].js',
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
    'moment': 'moment',
    // 'chroma-js': 'chroma-js'
  },
  plugins: [
    new webpack.DefinePlugin({
      XYZ_VERSION: JSON.stringify(require('./package.json').version)
    }),
    new webpack.ProvidePlugin({
      uhtml: 'uhtml'
    }),
    // new webpack.ProvidePlugin({
    //   'chroma-js': 'chroma-js'
    // })
  ]
  //stats: 'verbose'
  // stats: {
  //   optimizationBailout: true,
  //   maxModules: Infinity
  // }
};