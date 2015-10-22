import Io from 'lib/socket.io'

export class Socket {
  socket = Io.connect('http://localhost:3000');

  emit(evt, payload) {
    this.socket.emit(evt, payload);
  }
  on(evt, cb) {
    this.socket.on(evt, (payload) => {
      cb(payload);
    })
  }
}
