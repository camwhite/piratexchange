import {Socket} from 'services/socket'

export class Location {
  constructor(socket: Socket) {
    this.socket = socket;
  }
  getLocation() {
    var promise = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.socket.emit('user:located', {
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
