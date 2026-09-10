import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuditApiService } from './services/audit-api.service';
import {
  AuditRecord,
  AuditSearchCriteria,
  EventStatus,
  EventType
} from './models/audit-record.model';

type SortKey = 'eventDate' | 'eventTime' | 'userName' | 'eventType' | 'eventStatus' | 'applicationName' | 'businessFunction';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'audit-search',
  templateUrl: './audit-search.component.html',
  styleUrls: ['./audit-search.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppAuditSearchComponent implements OnInit {
  readonly searchForm: FormGroup;

  constructor(private readonly fb: FormBuilder, private readonly auditApi: AuditApiService) {
    this.searchForm = this.fb.group({
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
  }

  loading = false;
  searched = false;
  records: AuditRecord[] = [];
  selectedRecord: AuditRecord | null = null;
  selectedIds = new Set<string>();
  sortKey: SortKey = 'eventDate';
  sortDirection: SortDirection = 'desc';
  expandedSections = new Set<number>([1, 2]);
  currentPage = 1;
  pageSize = 5;
  readonly pageSizeOptions = [5, 20, 50];

  readonly eventTypes: EventType[] = ['Read', 'Print', 'Retrieve'];
  readonly eventStatuses: EventStatus[] = ['Success', 'Failed'];
  readonly Math = Math;

  get sortedRecords(): AuditRecord[] {
    const key = this.sortKey;
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    return [...this.records].sort((a, b) => {
      const av = key === 'eventDate' ? `${a.eventDate} ${a.eventTime}` : String(a[key]);
      const bv = key === 'eventDate' ? `${b.eventDate} ${b.eventTime}` : String(b[key]);
      return av.localeCompare(bv) * direction;
    });
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.sortedRecords.length / this.pageSize));
  }

  get pagedRecords(): AuditRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedRecords.slice(start, start + this.pageSize);
  }

  get allVisibleSelected(): boolean {
    return this.pagedRecords.length > 0 &&
      this.pagedRecords.every(record => this.selectedIds.has(record.id));
  }

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
      this.searchForm.controls['endDate'].setErrors({ range: true });
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

    this.loading = true;
    this.auditApi.search(criteria).subscribe({
      next: records => {
        this.records = records;
        this.currentPage = 1;
        this.selectedIds = new Set();
        this.searched = true;
        this.loading = false;
      },
      error: () => this.loading = false
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
    this.pageSize = 5;
    this.currentPage = 1;
    this.search();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
  }

  sortBy(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = key === 'eventDate' ? 'desc' : 'asc';
    }
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey !== key) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  toggleRecord(id: string): void {
    const next = new Set(this.selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIds = next;
  }

  toggleVisibleRecords(): void {
    const next = new Set(this.selectedIds);
    if (this.allVisibleSelected) {
      this.pagedRecords.forEach(record => next.delete(record.id));
    } else {
      this.pagedRecords.forEach(record => next.add(record.id));
    }
    this.selectedIds = next;
  }

  viewRecord(record: AuditRecord): void {
    this.selectedRecord = record;
    this.expandedSections = new Set([1, 2]);
  }

  closeDetails(): void {
    this.selectedRecord = null;
  }

  toggleSection(section: number): void {
    const next = new Set(this.expandedSections);
    next.has(section) ? next.delete(section) : next.add(section);
    this.expandedSections = next;
  }

  isSectionExpanded(section: number): boolean {
    return this.expandedSections.has(section);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pageCount) this.currentPage = page;
  }

  pages(): number[] {
    return Array.from({ length: this.pageCount }, (_, index) => index + 1);
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
