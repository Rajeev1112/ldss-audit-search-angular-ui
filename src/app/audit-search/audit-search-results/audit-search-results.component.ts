import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuditRecord, EventStatus } from '../models/audit-record.model';
import * as XLSX from 'xlsx';

type SortKey = 'eventDate' | 'eventTime' | 'userName' | 'eventType' | 'eventStatus' | 'applicationName' | 'businessFunction';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'audit-search-results',
  templateUrl: './audit-search-results.component.html'
})
export class AuditSearchResultsComponent {
  showExportMenu: 'all' | 'selected' | null = null;

  toggleExportMenu(type: 'all' | 'selected'): void {
    this.showExportMenu = this.showExportMenu === type ? null : type;
  }
  @Input() loading = false;
  @Input() searched = false;
  @Input() records!: AuditRecord[];
  @Input() pagedRecords!: AuditRecord[];
  @Input() selectedIds!: Set<string>;
  @Input() allVisibleSelected = false;
  @Input() pageCount = 1;
  @Input() currentPage = 1;
  @Input() sortKey!: SortKey;
  @Input() sortDirection!: SortDirection;
  @Input() pageSize = 5;
  @Input() pageSizeOptions!: number[];

  @Output() sortRequested = new EventEmitter<SortKey>();
  @Output() visibleRecordsToggled = new EventEmitter<void>();
  @Output() recordToggled = new EventEmitter<string>();
  @Output() recordViewed = new EventEmitter<AuditRecord>();
  @Output() pageRequested = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();

  readonly Math = Math;

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.pageSizeChanged.emit(parseInt(target.value, 10));
    }
  }

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

  exportToCSV(exportSelected: boolean = false): void {
    const recordsToExport = exportSelected ? this.getSelectedRecords() : this.records;
    if (recordsToExport.length === 0) {
      return;
    }

    const headers = [
      'Event Date',
      'Event Time',
      'User ID',
      'User Name',
      'Event Type',
      'Event Status',
      'Application Name',
      'Business Function',
      'IP Address'
    ];

    const csvContent = this.generateCSVContent(headers, recordsToExport);
    this.downloadFile(csvContent, 'audit-records.csv', 'text/csv');
  }

  exportToExcel(exportSelected: boolean = false): void {
    const recordsToExport = exportSelected ? this.getSelectedRecords() : this.records;
    if (recordsToExport.length === 0) {
      return;
    }

    const headers = [
      'Event Date',
      'Event Time',
      'User ID',
      'User Name',
      'Event Type',
      'Event Status',
      'Application Name',
      'Business Function',
      'IP Address'
    ];

    const data = recordsToExport.map(record => (
      [
        record.eventDate,
        record.eventTime,
        record.userId,
        record.userName,
        record.eventType,
        record.eventStatus,
        record.applicationName,
        record.businessFunction,
        record.ipAddress
      ]
    ));

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Records');
    XLSX.writeFile(workbook, 'audit-records.xlsx');
  }

  private getSelectedRecords(): AuditRecord[] {
    return this.records.filter(record => this.selectedIds.has(record.id));
  }

  private generateCSVContent(headers: string[], recordsToExport: AuditRecord[]): string {
    const headerRow = headers.join(',');
    const dataRows = recordsToExport.map(record =>
      [
        `"${record.eventDate}"`,
        `"${record.eventTime}"`,
        `"${record.userId}"`,
        `"${record.userName}"`,
        `"${record.eventType}"`,
        `"${record.eventStatus}"`,
        `"${record.applicationName}"`,
        `"${record.businessFunction}"`,
        `"${record.ipAddress}"`
      ].join(',')
    );

    return [headerRow, ...dataRows].join('\n');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
