import {ComponentMetadata as Component, ViewMetadata as View, ElementRef, Attribute} from 'angular2/angular2';

@Component({
  selector: 'svg-icon'
})

@View({
  template: `
    <object type="image/svg+xml" class="icon"></object>
  `
})

export class SvgIcon {
  constructor(elemRef: ElementRef) {
    this.el = elemRef.nativeElement.children[0];
    this.source = elemRef.nativeElement.getAttribute('src')
    this.el.setAttribute('data', this.source);
  }
}

