export class Location {
  getLocation() {
    var promise = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((pos) => {
        resolve(pos.coords);
      }, (err) => {
        reject(err);
      });
    });
    return promise;
  }
}
