import { isDevMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

if (!isDevMode()) {
  const noop = () => {};
  if (window) {
    window.console.log = noop;
    window.console.warn = noop;
    window.console.error = noop;
    window.console.info = noop;
    window.console.debug = noop;
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
