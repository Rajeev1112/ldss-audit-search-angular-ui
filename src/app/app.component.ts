import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuditApiService } from './services/audit-api.service';
import { AuditSearchCriteriaComponent } from './app-audit-search-criteria/audit-search-criteria.component';
import { AuditSearchResultsComponent } from './app-audit-search-results/audit-search-results.component';
import {
  AuditRecord,
  AuditSearchCriteria,
  EventStatus,
  EventType
} from './models/audit-record.model';

type SortKey = 'eventDate' | 'eventTime' | 'userName' | 'eventType' | 'eventStatus' | 'applicationName' | 'businessFunction';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuditSearchCriteriaComponent, AuditSearchResultsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auditApi = inject(AuditApiService);

  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly records = signal<AuditRecord[]>([]);
  readonly selectedRecord = signal<AuditRecord | null>(null);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly sortKey = signal<SortKey>('eventDate');
  readonly sortDirection = signal<SortDirection>('desc');
  readonly expandedSections = signal(new Set<number>([1, 2]));
  readonly currentPage = signal(1);
  readonly pageSize = signal(5);
  readonly pageSizeOptions = [5, 20, 50];

  readonly eventTypes: EventType[] = ['Read', 'Print', 'Retrieve'];
  readonly eventStatuses: EventStatus[] = ['Success', 'Failed'];
  readonly Math = Math;

  readonly searchForm = this.fb.group({
    startDate: [this.toInputDate(this.addDays(new Date(), -1)), Validators.required],
    endDate: [this.toInputDate(new Date()), Validators.required],
    applicationName: this.fb.control(
      { value: 'LDSS Unemployment Services Inquiry', disabled: true },
      Validators.required
    ),
    firstName: [''],
    lastName: [''],
    eventType: this.fb.control<EventType | ''>('', { nonNullable: true }),
    eventStatus: this.fb.control<EventStatus | ''>('', { nonNullable: true })
  });

  readonly sortedRecords = computed(() => {
    const key = this.sortKey();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;

    return [...this.records()].sort((a, b) => {
      const av = key === 'eventDate' ? `${a.eventDate} ${a.eventTime}` : String(a[key]);
      const bv = key === 'eventDate' ? `${b.eventDate} ${b.eventTime}` : String(b[key]);
      return av.localeCompare(bv) * direction;
    });
  });

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.sortedRecords().length / this.pageSize()))
  );

  readonly pagedRecords = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.sortedRecords().slice(start, start + this.pageSize());
  });

  readonly allVisibleSelected = computed(() =>
    this.pagedRecords().length > 0 &&
    this.pagedRecords().every(record => this.selectedIds().has(record.id))
  );

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const value = this.searchForm.getRawValue();
    if (value.startDate && value.endDate && value.startDate > value.endDate) {
      this.searchForm.controls.endDate.setErrors({ range: true });
      return;
    }

    const criteria: AuditSearchCriteria = {
      startDate: value.startDate ?? '',
      endDate: value.endDate ?? '',
      applicationName: value.applicationName ?? '',
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      eventType: value.eventType ?? '',
      eventStatus: value.eventStatus ?? ''
    };

    this.loading.set(true);
    this.auditApi.search(criteria).subscribe({
      next: records => {
        this.records.set(records);
        this.currentPage.set(1);
        this.selectedIds.set(new Set());
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  reset(): void {
    this.searchForm.reset({
      startDate: this.toInputDate(this.addDays(new Date(), -1)),
      endDate: this.toInputDate(new Date()),
      applicationName: 'LDSS Unemployment Services Inquiry',
      firstName: '',
      lastName: '',
      eventType: '',
      eventStatus: ''
    });
    this.pageSize.set(5);
    this.currentPage.set(1);
    this.search();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDirection.update(direction => direction === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDirection.set(key === 'eventDate' ? 'desc' : 'asc');
    }
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey() !== key) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  toggleRecord(id: string): void {
    const next = new Set(this.selectedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIds.set(next);
  }

  toggleVisibleRecords(): void {
    const next = new Set(this.selectedIds());
    if (this.allVisibleSelected()) {
      this.pagedRecords().forEach(record => next.delete(record.id));
    } else {
      this.pagedRecords().forEach(record => next.add(record.id));
    }
    this.selectedIds.set(next);
  }

  viewRecord(record: AuditRecord): void {
    this.selectedRecord.set(record);
    this.expandedSections.set(new Set([1, 2]));
  }

  closeDetails(): void {
    this.selectedRecord.set(null);
  }

  toggleSection(section: number): void {
    const next = new Set(this.expandedSections());
    next.has(section) ? next.delete(section) : next.add(section);
    this.expandedSections.set(next);
  }

  isSectionExpanded(section: number): boolean {
    return this.expandedSections().has(section);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pageCount()) this.currentPage.set(page);
  }

  pages(): number[] {
    return Array.from({ length: this.pageCount() }, (_, index) => index + 1);
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${month}/${day}/${year}`;
  }

  statusClass(status: EventStatus): string {
    return status === 'Success' ? 'status-success' : 'status-failed';
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
