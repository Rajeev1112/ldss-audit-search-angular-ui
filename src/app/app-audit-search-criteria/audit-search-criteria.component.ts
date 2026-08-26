import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventStatus, EventType } from '../models/audit-record.model';

@Component({
  selector: 'app-audit-search-criteria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './audit-search-criteria.component.html'
})
export class AuditSearchCriteriaComponent {
  @Input({ required: true }) searchForm!: FormGroup;
  @Input({ required: true }) eventTypes!: EventType[];
  @Input({ required: true }) eventStatuses!: EventStatus[];
  @Input({ required: true }) loading = false;

  @Output() searchRequested = new EventEmitter<void>();
  @Output() resetRequested = new EventEmitter<void>();
  @Output() multiValueToggled = new EventEmitter<{
    controlName: 'eventTypes' | 'eventStatuses';
    value: EventType | EventStatus;
  }>();

  toggleMultiValue(controlName: 'eventTypes' | 'eventStatuses', value: EventType | EventStatus): void {
    this.multiValueToggled.emit({ controlName, value });
  }

  isMultiValueSelected(controlName: 'eventTypes' | 'eventStatuses', value: EventType | EventStatus): boolean {
    return ((this.searchForm.controls[controlName].value ?? []) as string[]).includes(value);
  }
}
