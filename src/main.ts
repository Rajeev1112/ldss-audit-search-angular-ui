import 'zone.js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { AppAuditSearchComponent } from './app/audit-search/audit-search.component';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((error: unknown) => console.error(error));
