import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {
  socket = io.connect();

  emit(evt, payload) {
    this.socket.emit(evt, payload);
  }
  on(evt, cb) {
    this.socket.on(evt, (payload) => {
      cb(payload);
    });
  }
  join(room) {
    this.socket.emit('join', room);
  }
  leave(room) {
    this.socket.emit('leave', room);
  }
  unsync() {
    this.socket.removeAllListeners();
  }
}
