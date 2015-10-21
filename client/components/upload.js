import {ComponentMetadata as Component, ViewMetadata as View, ElementRef} from 'angular2/angular2';
import {WebRTC} from 'services/webrtc';

@Component({
  selector: 'upload',
  providers: [WebRTC]
})

@View({
  template: '<input type="file"></input>'
})

export class Upload {
  constructor(elemRef: ElementRef, webRTC: WebRTC) {
    this.file = '';
    this.el = elemRef.nativeElement.children[0];
    this.webRTC = webRTC.init(this.el);
  }
}
