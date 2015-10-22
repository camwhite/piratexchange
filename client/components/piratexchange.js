import {ComponentMetadata as Component, ViewMetadata as View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Location} from 'services/location';
import {Socket} from 'services/socket';
import {Upload} from 'components/upload';

@Component({
  selector: 'piratexchange',
  prodivers: [Location, Socket]
})

@View({
  templateUrl: '/components/piratexchange.html',
  directives: [CORE_DIRECTIVES, Upload]
})

export class Piratexchange {
  constructor(locator: Location, socket: Socket) {
    this.users = [];
    this.distances = [{id: '1234', distance: 0}];

    locator.getLocation()
    .then((coords) => {
      this.location = {
        lat: coords.latitude,
        lng: coords.longitude
      }
    })
    .catch((err) => console.log(err));

    socket.on('push:location', (user) => {
      this.users.push(user);
      console.log(this.users);
    })
  }
  matchmaking() {
    let geo = google.maps.geometry.spherical;
    let p1 = new google.maps.LatLng(this.location.lat, this.location.lng);

    this.users.map((user) => {
      let p2 = new google.maps.LatLng(user.pos.lat, user.pos.lng);
      let distance = geo.computeDistanceBetween(p1, p2);

      this.distances.push({id: user.id, distance: distance});
    });

    this.match = this.distances.reduce(function (prev, curr) {
      return (Math.abs(curr.distance) < Math.abs(prev.distance) ? curr : prev);
    });

    console.log(this.match);
  }
}
