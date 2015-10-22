import {ComponentMetadata as Component, ViewMetadata as View, bootstrap} from 'angular2/angular2';
import {ROUTER_BINDINGS, Router, RouterOutlet} from 'angular2/router';
import {Location} from 'services/location';
import {WebRTC} from 'services/webrtc';
import {Socket} from 'services/socket';
import {Piratexchange} from 'components/piratexchange';

@Component({
  selector: 'main',
  viewBindings: [Location, WebRTC, Socket],
  providers: [Router]
})

@View({
  directives: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `
})

class Main {
  constructor(router: Router) {
    this.router = router;

    router
      .config([{ path: '/', as: 'piratexchange', component: Piratexchange }])
      .then((_) => router.navigate('/'))
  }
}

bootstrap(Main, ROUTER_BINDINGS);
