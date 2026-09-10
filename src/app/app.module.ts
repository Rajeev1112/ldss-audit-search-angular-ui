import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppAuditSearchComponent } from './audit-search/audit-search.component';
import { AuditSearchCriteriaComponent } from './audit-search/audit-search-criteria/audit-search-criteria.component';
import { AuditSearchResultsComponent } from './audit-search/audit-search-results/audit-search-results.component';

@NgModule({
  declarations: [
    AppAuditSearchComponent,
    AuditSearchCriteriaComponent,
    AuditSearchResultsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  bootstrap: [AppAuditSearchComponent]
})
export class AppModule {}