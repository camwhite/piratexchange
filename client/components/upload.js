import {ComponentMetadata as Component, ViewMetadata as View, ElementRef} from 'angular2/angular2';
import {RouteParams} from 'angular2/router';
import {WebRTC} from 'services/webrtc';

@Component({
  selector: 'upload',
  providers: [RouteParams, WebRTC]
})

@View({
  template: '<input type="file"></input>'
})

export class Upload {
  constructor(elemRef: ElementRef, routeParams: RouteParams, webRTC: WebRTC) {
    this.routeParams = routeParams;
    this.el = elemRef.nativeElement.children[0];

    this.webRTC = webRTC.init(this.routeParams.params, this.el);
  }
}
