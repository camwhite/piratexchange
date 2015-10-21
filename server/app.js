var express = require('express');
var app = express();

app.use(require('connect-livereload')());

app.get('/', function (req, res) {
  res.send('shit ball!');
});

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log('Hello from Express server listening on port:', port);
});
