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
  constructor(routeParams: RouteParams) {
    console.log(routeParams.params);
  }
}
