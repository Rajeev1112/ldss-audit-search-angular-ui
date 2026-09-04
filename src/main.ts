import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppAuditSearchComponent } from './app/app-audit-search/app-audit-search.component';

bootstrapApplication(AppAuditSearchComponent, appConfig)
  .catch((error: unknown) => console.error(error));
