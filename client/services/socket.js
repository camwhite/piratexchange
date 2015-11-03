import Io from 'lib/socket.io';

export class Socket {
  socket = Io.connect();

  emit(evt, payload) {
    this.socket.emit(evt, payload);
  }
  on(evt, cb) {
    this.socket.on(evt, (payload) => {
      cb(payload);
    });
  }
  init(room) {
    this.socket.emit('join', room);
  }
  leave(room) {
    this.socket.emit('leave', room);
  }
  unSync() {
    this.socket.removeAllListeners();
  }
}
