import {ComponentMetadata as Component, ViewMetadata as View, bootstrap} from 'angular2/angular2';
import {Location} from 'services/location';
import {WebRTC} from 'services/webrtc';
import {Socket} from 'services/socket';
import {Piratexchange} from 'components/piratexchange';

@Component({
  selector: 'main',
  viewBindings: [Location, WebRTC, Socket]
})

@View({
  directives: [Piratexchange],
  template: `
    <piratexchange></piratexchange>
  `
})

class Main {

}

bootstrap(Main);
