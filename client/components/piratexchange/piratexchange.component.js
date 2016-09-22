'use strict';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { SocketService } from '../../services/socket.service';
import { SvgComponent } from '../common/svg.component';

import * as _ from 'lodash';

@Component({
  selector: 'piratexchange',
  directives: [SvgComponent],
  styles: [`
    ${require('./piratexchange.style.scss')}
  `],
  template: `
    ${require('./piratexchange.template.html')}
  `
})
export class PiratexchangeComponent {
  constructor(router: Router, location: LocationService, socket: SocketService) {
    this.router = router;
    this.location = location;
    this.socket = socket;
  }
  ngOnInit() {
    this.isChrome = /chrome/i.test(navigator.userAgent);
    this.distances = [];
    this.peers = [];
    this.me = {};

    this.socket.on('peer:available', (peer) => {
      this.peers.push(peer);
    });
    this.socket.on('peer:unavailable', (peers) => {
      _.remove(this.peers, (p) => p.id == peers.me || p.id == peers.peer);
    });
    this.socket.on('peer:match', (peers) => {
      this.router.navigate(['/hideout'], { queryParams: { room: `${peers.peer}${peers.me}` }});
    });
  }
  ngOnDestroy() {
    this.socket.unsync();
  }
  onMatchmaking() {
    this.location.getLocation()
      .then(coords => {
        this.me.location = {
          lat: coords.latitude,
          lng: coords.longitude
        }
        this.handleMatchmaking();
      }).catch((err) => console.log(err));
  }
  handleMatchmaking() {
    let geo = google.maps.geometry.spherical;
    let p1 = new google.maps.LatLng(this.me.location.lat, this.me.location.lng);

    this.peers.map(user => {
      let p2 = new google.maps.LatLng(user.pos.lat, user.pos.lng);
      let distance = geo.computeDistanceBetween(p1, p2);

      this.distances.push({ id: user.id, distance: distance });
    });

    this.match = this.distances.length == 0 ? undefined : this.distances.reduce((prev, curr) => {
      return (Math.abs(curr.distance) < Math.abs(prev.distance) ? curr : prev);
    });

    if(this.match) {
      this.me.id = this.socket.socket.id;
      this.socket.emit('peer:match', { me: this.me.id, peer: this.match.id });
      this.router.navigate(['/hideout'], { queryParams: { room: `${this.match.id}${this.me.id}` }});
    }
    else {
      this.noMatches = true;
      this.time = 5;

      let countdown = setInterval(() => {
        this.time--;
        if(this.time == 0) {
          clearInterval(countdown);
          this.handleMatchmaking();
        }
      }, 1000);
    }
  }
}
