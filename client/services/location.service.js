import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';

@Injectable()
export class LocationService {
  constructor(socket: SocketService) {
    this.socket = socket;
  }
  getLocation() {
    var promise = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(pos => {
        this.socket.emit('peer:located', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });

        resolve(pos.coords);
      }, (err) => {
        reject(err);
      });
    });
    return promise;
  }
}
