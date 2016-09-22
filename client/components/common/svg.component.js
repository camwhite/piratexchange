'use strict';

import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'svg-icon',
  template: `
    <div class="icon" [innerHTML]="svg"></div>
  `
})

export class SvgComponent {
  @Input() src;

  constructor(sanitizer: DomSanitizer, http: Http) {
    this.sanitizer = sanitizer;
    this.http = http;
  }
  ngOnInit() {
    this.http.get(this.src)
      .subscribe(svg => this.svg = this.sanitizer.bypassSecurityTrustHtml(svg._body));
  }
}

