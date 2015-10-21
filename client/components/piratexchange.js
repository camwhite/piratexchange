import {ComponentMetadata as Component, ViewMetadata as View, EventEmitter, CORE_DIRECTIVES} from 'angular2/angular2';
import {Location} from 'services/location'
import {Upload} from 'components/upload'

@Component({
  selector: 'piratexchange',
  prodivers: [Location]
})

@View({
  templateUrl: '/components/piratexchange.html',
  directives: [CORE_DIRECTIVES, Upload]
})

export class Piratexchange {
  constructor(locator: Location) {
    locator.getLocation()
    .then((coords) => this.location = coords)
    .catch((err) => console.log(err));
  }
  onFileChanged(newFile) {
    console.log(newFile);
  }
}
