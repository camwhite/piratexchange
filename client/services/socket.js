import Io from 'lib/socket.io'

export class Socket {
  socket = Io.connect('http://localhost:3000');
}
