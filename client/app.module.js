import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { PiratexchangeComponent } from './components/piratexchange/piratexchange.component';
import { HideoutComponent } from './components/hideout/hideout.component';
import { UploadComponent } from './components/common/upload.component'
import { SvgComponent } from './components/common/svg.component'

const routes = [
  {
    path: '',
    component: PiratexchangeComponent,
  },
  {
    path: 'hideout',
    component: HideoutComponent,
  }
];
const routing = RouterModule.forRoot(routes);

@NgModule({
  imports:      [ BrowserModule, HttpModule, routing ],
  declarations: [ AppComponent, PiratexchangeComponent, HideoutComponent, UploadComponent, SvgComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
