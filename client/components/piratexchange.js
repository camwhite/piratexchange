import {ComponentMetadata as Component, ViewMetadata as View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Router} from 'angular2/router';
import {Location} from 'services/location';
import {Socket} from 'services/socket';
import {SvgIcon} from 'components/svg-icon';

@Component({
  selector: 'piratexchange',
  prodivers: [Router, Location, Socket]
})

@View({
  templateUrl: '/components/piratexchange.html',
  directives: [CORE_DIRECTIVES, SvgIcon]
})

export class Piratexchange {
  constructor(router: Router, locator: Location, socket: Socket) {
    this.router = router;
    this.locator = locator;
    this.socket = socket;

    this.me = {
      id: this.socket.socket.id
    }

    this.users = [];
    this.distances = [];

    this.locator.getLocation()
    .then((coords) => {
      this.me.location = {
        lat: coords.latitude,
        lng: coords.longitude
      }
    })
    .catch((err) => console.log(err));

    this.userHandler();
  }
  userHandler() {
    this.socket.on('push:location', (user) => {
      this.users.push(user);
      console.log(this.users);
    });
    this.socket.on('users:matched', (match) => {
      console.log(match);
      this.router.navigate('/hideout/' + match.id);
    });
  }
  matchmaking() {
    let geo = google.maps.geometry.spherical;
    let p1 = new google.maps.LatLng(this.me.location.lat, this.me.location.lng);

    this.users.map((user) => {
      let p2 = new google.maps.LatLng(user.pos.lat, user.pos.lng);
      let distance = geo.computeDistanceBetween(p1, p2);

      this.distances.push({id: user.id, distance: distance});
    });

    this.match = this.distances.length == 0 ? undefined : this.distances.reduce((prev, curr) => {
      return (Math.abs(curr.distance) < Math.abs(prev.distance) ? curr : prev);
    });

    if(this.match != undefined) {
      this.socket.init(this.match.id);
      this.socket.emit('match:made', this.match);

      this.router.navigate('/hideout/' + this.match.id);
    }
    else {
      this.noMatches = true;
    }

    console.log(this.match);
  }
}
