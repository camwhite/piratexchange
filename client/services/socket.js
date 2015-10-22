import Io from 'lib/socket.io';

export class Socket {
  socket = Io.connect(':3000');

  emit(evt, payload) {
    this.socket.emit(evt, payload);
  }
  on(evt, cb) {
    this.socket.on(evt, (payload) => {
      cb(payload);
    })
  }
  init(room) {
    this.emit('join', room);
  }
}
