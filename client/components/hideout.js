import {ComponentMetadata as Component, ViewMetadata as View, CORE_DIRECTIVES} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import {Socket} from 'services/socket';
import {Upload} from 'components/upload';

@Component({
  selector: 'hideoout',
  prodivers: [RouteParams, Socket]
})

@View({
  templateUrl: '/components/hideout.html',
  directives: [CORE_DIRECTIVES, Upload]
})

export class Hideout {
  constructor(routeParams: RouteParams, socket: Socket) {
    this.routeParams = routeParams;
    this.socket = socket;

    this.socket.unSync();
    this.socket.init('hideout:' + this.routeParams.params.id + this.socket.socket.id);
  }
}
