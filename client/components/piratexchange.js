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
    .then((coords) => this.location = coords)
    .catch((err) => console.log(err));
  }
}
