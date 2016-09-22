'use strict';

const io = require('socket.io');
const chalk = require('chalk');

let bindListeners = (io) => {
  io.on('connection', (socket) => {
    console.log(chalk.yellow('socket-io: ' + socket.id + ' connected at ' + new Date()));

    // Hanlde rooms
    socket.on('join', (room) => {
      console.log(chalk.green('socket-io: ' + socket.id + ' joined room ' + room));
      socket.join(room);
      socket.to(room).broadcast.emit('peer:join', socket.id);
    });
    socket.on('leave', (room) => {
      console.log(chalk.red('socket-io: ' + socket.id + ' left room ' + room));
      socket.leave(room);
      socket.to(room).emit('peer:leave', socket.id);
    });

    // Hanlde peers
    socket.on('peer:located', (pos) => {
      socket.broadcast.emit('peer:available', { pos: pos, id: socket.id });
    });
    socket.on('peer:match', (peers) => {
      console.log(chalk.blue('socket-io: ' + peers.me + ' matched with ' + peers.peer));
      socket.emit('peer:unavailable', peers);
      socket.to(peers.peer).emit('peer:match', peers);
    });
    socket.on('peer:signal', (call) => {
      console.log(chalk.cyan(`socket-io: ${socket.id} signalled in ${call.room}`));
      socket.to(call.room).broadcast.emit('peer:signal', call);
    });
    socket.on('peer:data', (data) => {
      socket.to(data.room).broadcast.emit('peer:data', data);
    });

    socket.on('disconnect', () => {
      io.emit('peer:unavailable', { peer: socket.id });
    });
  });
}

exports.connectTo = (server) => {
  var sockets = io(server);
  bindListeners(sockets);
}
