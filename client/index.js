import {ComponentMetadata as Component, ViewMetadata as View, bind, bootstrap} from 'angular2/angular2';
import {ROUTER_BINDINGS, RouteConfig, RouterOutlet, LocationStrategy, PathLocationStrategy} from 'angular2/router';
import {Location} from 'services/location';
import {WebRTC} from 'services/webrtc';
import {Socket} from 'services/socket';
import {Piratexchange} from 'components/piratexchange';
import {Hideout} from 'components/hideout';

@Component({
  selector: 'main',
  viewBindings: [Location, WebRTC, Socket]
})

@View({
  directives: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `
})

@RouteConfig([
  { path: '/', as: 'piratexchange', component: Piratexchange },
  { path: '/hideout/:id', as: 'hideout', component: Hideout }
])

class Main {
  constructor() {

  }
}

setTimeout(() => {
  bootstrap(Main, [ROUTER_BINDINGS, bind(LocationStrategy).toClass(PathLocationStrategy)]);
}, 3000);
