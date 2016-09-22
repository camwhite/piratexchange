'use strict';

// Modules
const path = require('path');
const webpack = require('webpack');

var entryPoints = [
  path.join(__dirname, 'client', 'main.js')
];

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin()
];

var devTool = '';

if (process.env.NODE_ENV !== 'production') {
  entryPoints.push('webpack-hot-middleware/client');
  plugins.push(new webpack.HotModuleReplacementPlugin());
  plugins.push(new webpack.NoErrorsPlugin());
  plugins.push(new webpack.DefinePlugin({
    PROD: false
  }));

  devTool = 'eval';
}
else {
  plugins.push(new webpack.optimize.DedupePlugin());
  plugins.push(new webpack.DefinePlugin({
    PROD: true
  }));
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    mangle: {
      screw_ie8: true
    },
    compress: {
      warnings: true
    }
  }));

  devTool = 'source-map';
}

module.exports = {
  entry: {
    main: entryPoints,
    vendor: ['core-js', 'zone.js/dist/zone', 'eric-meyer-reset.scss/_reset.scss']
  },
  devtool: devTool,
  output: {
    path: path.join(__dirname, 'public', 'js'),
    dist: 'public/js',
    publicPath: '/js',
    filename: '[name].bundle.js'
  },
  resolveLoader: {
    root: [path.resolve('node_modules')],
    extensions: ['', '.js', '.ts']
  },
  resolve: {
    root: [path.resolve('node_modules'), path.join('public', 'js')],
    extensions: ['', '.js', '.ts', '.json']
  },
  module: {
    loaders: [
      {
        test: /\.(js|ts)$/,
        include: [
         path.resolve('client'),
         path.resolve('node_modules')
        ],
        loader: 'awesome-typescript-loader'
      },
      { test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/, loader: 'file' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.scss$/, loaders: ['style', 'css', 'sass'] },
      { test: /\.css$/, loaders: ['style', 'css'] }
    ],
    externals: {
      '@angular': 'angular',
    },
  },
  plugins: plugins
};
