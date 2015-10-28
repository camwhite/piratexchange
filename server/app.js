var app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

app.use(require('connect-livereload')());

app.get('/', (req, res) => {
  res.send('shit ball!');
});

server.listen(3000, () => {
  var port = server.address().port;
  console.log('Hello from Express server listening on port:', port);
});

io.on('connection', (socket) => {
  console.log('Socket ' + socket.id + ' connected at ' + new Date());

  socket.on('join', (room) => {
    console.log('Socket ' + socket.id + ' joined room ' + room);
    socket.join(room);
  });

  socket.on('user:located', (pos) => {
    socket.broadcast.emit('push:location', {pos: pos, id: socket.id});
  });

  socket.on('match:made', (match) => {
    console.log('Socket ' + socket.id + ' matched with ' + match.id);
    socket.to(match.id).emit('users:matched', match);
  });

  socket.on('new:candidate', (peer) => {
    console.log(`Socket ${socket.id} asked for ${peer.to}`)
    socket.to(peer.to).emit('add:candidate', peer);
  });

  socket.on('msg', (call) => {
    console.log(`Socket ${call.by} communicated with ${call.to}`)
    socket.to(call.room).emit('msg', call);
  });
});
