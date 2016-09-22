import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocationService } from './services/location.service';
import { SocketService } from './services/socket.service';
import { WebRTCService } from './services/webrtc.service';

@Component({
  selector: 'app',
  providers: [
    LocationService,
    SocketService,
    WebRTCService
  ],
  directives: [RouterOutlet],
  styles: [`
    ${require('./main.scss')}
  `],
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent { }
