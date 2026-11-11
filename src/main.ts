import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-MX';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';

registerLocaleData(localeEs);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
