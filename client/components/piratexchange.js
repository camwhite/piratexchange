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

    this.me = {};
    this.users = [];
    this.distances = [];

    this.isChrome = /chrome/i.test(navigator.userAgent);

    this.locator.getLocation()
    .then((coords) => {
      this.me.location = {
        lat: coords.latitude,
        lng: coords.longitude
      }
    })
    .catch((err) => console.log(err));

    this.socket.on('push:location', (user) => {
      this.users.push(user);
    });
    this.socket.on('users:matched', (match) => {
      this.router.navigate(`/hideout/${match.to}${match.from}`);
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
      this.me.id = this.socket.socket.id;
      this.socket.emit('match:made', {from: this.me.id, to: this.match.id});;

      this.router.navigate(`/hideout/${this.match.id}${this.me.id}`);
    }
    else {
      this.noMatches = true;
      this.time = 5;

      let countdown = setInterval(() => {
        this.time--;
        if(this.time == 0) {
          clearInterval(countdown);
          this.matchmaking();
        }
      }, 1000);
    }
  }
}
