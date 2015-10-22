var app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

app.use(require('connect-livereload')());

app.get('/', function (req, res) {
  res.send('shit ball!');
});

server.listen(3000, function() {
  var port = server.address().port;
  console.log('Hello from Express server listening on port:', port);
});

io.on('connection', function(socket) {
  console.log('yooo');
});
