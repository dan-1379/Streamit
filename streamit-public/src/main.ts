import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { ContentList } from './app/content-list/content-list';

bootstrapApplication(ContentList, appConfig)
  .catch((err) => console.error(err));