'use strict';

import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebRTCService } from '../../services/webrtc.service';

@Component({
  selector: 'upload',
  template: `
    <input type="file" (change)="webRTC.onChange($event)" />
    <progress max="0" value="0"></progress>
    <progress max="0" value="0"></progress>
    <div class="download"></div>
  `
})
export class UploadComponent {
  constructor(elemRef: ElementRef, route: ActivatedRoute, webRTC: WebRTCService) {
    this.snapshot = route.snapshot;
    this.el = elemRef.nativeElement;
    this.webRTC = webRTC;
  }
  ngOnInit() {
    this.webRTC.init(this.snapshot.queryParams.room, this.el);
  }
}
