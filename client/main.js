///<reference path="../typings/index.d.ts" />
'use strict'

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule);

if(module.hot) {
  module.hot.accept();
}
