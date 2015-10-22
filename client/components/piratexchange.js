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
    locator.getLocation()
    .then((coords) => {
      this.location = {
        lat: coords.latitude,
        lng: coords.longitude
      }
    })
    .catch((err) => console.log(err));
  }
  match() {
    let geo = google.maps.geometry.spherical;
    let p1 = new google.maps.LatLng(this.location.lat, this.location.lng);
    let p2 = new google.maps.LatLng(50.087692, 14.421150);

    this.distance = geo.computeDistanceBetween(p1, p2);
    console.log(this.distance);
  }
}
