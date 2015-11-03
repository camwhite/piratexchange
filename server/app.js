var express = require('express'),
    app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    path = require('path');

app.use(require('connect-livereload')());
app.use(express.static(path.join(__dirname, '../client')));

server.listen(process.env.PORT || 3000, () => {
  var port = server.address().port;
  console.log('Hello from Express server listening on port:', port);
});

io.on('connection', (socket) => {
  console.log('Socket ' + socket.id + ' connected at ' + new Date());

  socket.on('join', (room) => {
    console.log('Socket ' + socket.id + ' joined room ' + room);
    socket.join(room);
    socket.to(room).emit('status:changed', socket.adapter.rooms[room]);
  });

  socket.on('leave', (room) => {
    console.log('Socket ' + socket.id + ' left room ' + room);
    socket.leave(room);
    socket.to(room).emit('status:changed', socket.adapter.rooms[room]);
  });

  socket.on('user:status', (room) => {
    socket.to(room).emit('status:changed', socket.adapter.rooms[room]);
  });

  socket.on('user:located', (pos) => {
    socket.broadcast.emit('push:location', {pos: pos, id: socket.id});
  });

  socket.on('match:made', (matched) => {
    console.log('Socket ' + matched.from + ' matched with ' + matched.to);
    socket.to(matched.to).emit('users:matched', matched);
  });

  socket.on('msg', (call) => {
    console.log(`Socket ${call.by} initiated ${call.type} with ${call.to}`)
    socket.to(call.room).emit('msg', call);
  });

  socket.on('sending:data', (file) => {
    socket.to(file.room).broadcast.emit('data', file);
  });
});
