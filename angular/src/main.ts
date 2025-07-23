import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { MainLayoutComponent } from '@features/main-layout/main-layout.component';

bootstrapApplication(MainLayoutComponent, appConfig)
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
