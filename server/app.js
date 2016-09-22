/// <reference path="../typings/index.d.ts" />
'use strict';

// Main modules
const path = require('path');
const chalk = require('chalk');
const morgan = require('morgan');
const express = require('express');
const favicon = require('serve-favicon');

let app = express();

// Paths to serve
let publicPath = path.join(__dirname, '../public/');
let pathToBundle = path.join(publicPath, 'index.html');


// Middlewares
if(process.env.NODE_ENV != 'production') {
  app.use(morgan('dev'));
}

// Serve up client bundle
app.use('/assets', express.static(path.join(publicPath, '/assets')));
app.use('/js', express.static(path.join(publicPath, '/js')));

// App routes
let routes = ['/', '/hideout*']
app.get(routes, (req, res) => {
  res.sendFile(pathToBundle);
});

module.exports = app;
