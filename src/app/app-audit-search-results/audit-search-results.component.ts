import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuditRecord, EventStatus } from '../models/audit-record.model';

type SortKey = 'eventDate' | 'eventTime' | 'userName' | 'eventType' | 'eventStatus' | 'applicationName' | 'businessFunction';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-audit-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-search-results.component.html'
})
export class AuditSearchResultsComponent {
  @Input({ required: true }) loading = false;
  @Input({ required: true }) searched = false;
  @Input({ required: true }) records!: AuditRecord[];
  @Input({ required: true }) pagedRecords!: AuditRecord[];
  @Input({ required: true }) selectedIds!: Set<string>;
  @Input({ required: true }) allVisibleSelected = false;
  @Input({ required: true }) pageCount = 1;
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) sortKey!: SortKey;
  @Input({ required: true }) sortDirection!: SortDirection;

  @Output() sortRequested = new EventEmitter<SortKey>();
  @Output() visibleRecordsToggled = new EventEmitter<void>();
  @Output() recordToggled = new EventEmitter<string>();
  @Output() recordViewed = new EventEmitter<AuditRecord>();
  @Output() pageRequested = new EventEmitter<number>();

  readonly Math = Math;

  sortIcon(key: SortKey): string {
    if (this.sortKey !== key) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${month}/${day}/${year}`;
  }

  statusClass(status: EventStatus): string {
    return status === 'Success' ? 'status-success' : 'status-failed';
  }
}
