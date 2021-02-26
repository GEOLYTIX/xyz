const path = require('path');

const webpack = require('webpack');

module.exports = {
  entry: {
    mapp: ['./lib/index.mjs']
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].js'
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
  },
  externals: {
    'moment': 'moment'
  },
  plugins: [
    new webpack.DefinePlugin({
      XYZ_VERSION: JSON.stringify(require('./package.json').version)
    })
  ]
}