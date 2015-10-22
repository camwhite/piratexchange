import {ComponentMetadata as Component, ViewMetadata as View, bootstrap} from 'angular2/angular2';
import {Router, RouterOutlet, RootRouter} from 'angular2/router';
import {Location} from 'services/location';
import {WebRTC} from 'services/webrtc';
import {Socket} from 'services/socket';
import {Piratexchange} from 'components/piratexchange';

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

class Main {
  constructor(router: Router) {
    this.router = router;
    // Here we configure, for each route, which component should be added and its alias for URL linking
    router
      .config('/', Piratexchange, 'piratexchange')
      .then((_) => router.navigate('/'))
  }
}

bootstrap(Main, [
  // Here we're creating the Router.
  // We're also configuring DI, so that each time a Router is requested, it's automatically returned.
  bind(Router).toValue(new RootRouter(new Pipeline())));
