import {ComponentMetadata as Component, ViewMetadata as View, CORE_DIRECTIVES} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import {Socket} from 'services/socket';
import {WebRTC} from 'services/webrtc';
import {Upload} from 'components/upload';

@Component({
  selector: 'hideoout',
  prodivers: [RouteParams, Socket, WebRTC]
})

@View({
  templateUrl: '/components/hideout.html',
  directives: [CORE_DIRECTIVES, Upload]
})

export class Hideout {
  constructor(routeParams: RouteParams, socket: Socket, webRTC: WebRTC) {
    this.routeParams = routeParams;
    this.socket = socket;
    this.webRTC = webRTC;

    this.room = this.routeParams.params.id;

    this.socket.unSync();
    this.socket.init(this.room);

    this.socket.on('msg', (call) => {
      this.webRTC.handleCall(call);
    });

    this.socket.on('data', (file) => {
      this.file = {
        name: file.name,
        size: file.size,
        formattedSize: file.formattedSize
      };

      this.webRTC.file = this.file;
      this.webRTC.receiveProgress.max = file.size;
    });
  }
}
