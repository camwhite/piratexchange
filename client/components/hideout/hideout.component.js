'use strict'; 

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { SocketService } from '../../services/socket.service';
import { WebRTCService } from '../../services/webrtc.service';
import { UploadComponent } from '../common/upload.component';

@Component({
  selector: 'hideoout',
  directives: [UploadComponent],
  styles: [`
    ${require('./hideout.style.scss')}
  `],
  template: `
    ${require('./hideout.template.html')}
  `
})
export class HideoutComponent {
  constructor(route: ActivatedRoute, socket: SocketService, webRTC: WebRTCService) {
    this.route = route;
    this.socket = socket;
    this.webRTC = webRTC;
  }
  ngOnInit() {
    this.peer = {};
    this.room = this.route.snapshot.queryParams.room;

    this.socket.join(this.room);
    this.socket.on('peer:join', (peer) => {
      this.peer = peer;
    });
    this.socket.on('peer:leave', () => {
      this.peer = null;
    });

    window.onbeforeunload = () => {
      if(this.webRTC.sendChannel) {
        this.webRTC.sendChannel.close();
      }
      this.socket.leave(this.room);
    }
  }
  ngOnDestroy() {
    if(this.webRTC.sendChannel) {
      this.webRTC.sendChannel.close();
    }
    this.socket.leave(this.room);
  }
}
