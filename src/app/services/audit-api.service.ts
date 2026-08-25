import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuditRecord, AuditSearchCriteria } from '../models/audit-record.model';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly records: AuditRecord[] = [
    {
      id: 'AUD-10001',
      eventDate: '2026-08-24',
      eventTime: '16:42:18',
      userId: 'USR1042',
      userName: 'User 1042',
      eventType: 'Read',
      eventStatus: 'Success',
      applicationName: 'LDSS Unemployment Services Inquiry',
      businessFunction: 'Search for UIB data',
      ipAddress: '10.24.18.42',
      requestData: { ssn: '***-**-4831', startDate: '08/01/2026', endDate: '08/24/2026' },
      responseData: { claimantInformation: 'Claimant record returned successfully.' }
    },
    {
      id: 'AUD-10002',
      eventDate: '2026-08-24',
      eventTime: '15:11:05',
      userId: 'USR1068',
      userName: 'User 1068',
      eventType: 'Update',
      eventStatus: 'Success',
      applicationName: 'LDSS Unemployment Services Inquiry',
      businessFunction: 'Update claimant inquiry',
      ipAddress: '10.24.22.17',
      requestData: { ssn: '***-**-7124', startDate: '08/10/2026', endDate: '08/24/2026' },
      responseData: { claimantInformation: 'Claimant information updated.' }
    },
    {
      id: 'AUD-10003',
      eventDate: '2026-08-23',
      eventTime: '13:27:49',
      userId: 'USR1017',
      userName: 'User 1017',
      eventType: 'Create',
      eventStatus: 'Success',
      applicationName: 'LDSS Unemployment Services Inquiry',
      businessFunction: 'Create inquiry',
      ipAddress: '10.24.11.89',
      requestData: { ssn: '***-**-2910', startDate: '08/01/2026', endDate: '08/23/2026' },
      responseData: { claimantInformation: 'New inquiry created.' }
    },
    {
      id: 'AUD-10004',
      eventDate: '2026-08-23',
      eventTime: '10:05:31',
      userId: 'USR1091',
      userName: 'User 1091',
      eventType: 'Read',
      eventStatus: 'Failed',
      applicationName: 'LDSS Unemployment Services Inquiry',
      businessFunction: 'Search for UIB data',
      ipAddress: '10.24.20.66',
      requestData: { ssn: '***-**-1048', startDate: '08/20/2026', endDate: '08/23/2026' },
      responseData: { claimantInformation: 'No claimant data was returned.' }
    },
    {
      id: 'AUD-10005',
      eventDate: '2026-08-22',
      eventTime: '17:54:12',
      userId: 'USR1042',
      userName: 'User 1042',
      eventType: 'Read',
      eventStatus: 'Success',
      applicationName: 'LDSS Unemployment Services Inquiry',
      businessFunction: 'Search for UIB data',
      ipAddress: '10.24.18.42',
      requestData: { ssn: '***-**-4831', startDate: '08/15/2026', endDate: '08/22/2026' },
      responseData: { claimantInformation: 'Claimant record returned successfully.' }
    },
    {
      id: 'AUD-10006',
      eventDate: '2026-08-22',
      eventTime: '09:36:44',
      userId: 'USR1068',
      userName: 'User 1068',
      eventType: 'Delete',
      eventStatus: 'Failed',
      applicationName: 'LDSS Unemployment Services Inquiry',
      businessFunction: 'Remove inquiry',
      ipAddress: '10.24.22.17',
      requestData: { ssn: '***-**-7124', startDate: '08/01/2026', endDate: '08/22/2026' },
      responseData: { claimantInformation: 'Delete operation was not permitted.' }
    },
    {
      id: 'AUD-10007',
      eventDate: '2026-08-21',
      eventTime: '14:21:03',
      userId: 'USR1017',
      userName: 'User 1017',
      eventType: 'Read',
      eventStatus: 'Success',
      applicationName: 'LDSS Unemployment Services Inquiry',
      businessFunction: 'Search for UIB data',
      ipAddress: '10.24.11.89',
      requestData: { ssn: '***-**-2910', startDate: '08/12/2026', endDate: '08/21/2026' },
      responseData: { claimantInformation: 'Claimant record returned successfully.' }
    }
  ];

  search(criteria: AuditSearchCriteria): Observable<AuditRecord[]> {
    const start = new Date(`${criteria.startDate}T00:00:00`);
    const end = new Date(`${criteria.endDate}T23:59:59`);

    const result = this.records.filter(record => {
      const eventDate = new Date(`${record.eventDate}T${record.eventTime}`);
      const inRange = eventDate >= start && eventDate <= end;
      const appMatch = !criteria.applicationName ||
        record.applicationName.toLowerCase().includes(criteria.applicationName.toLowerCase());
      const userMatch = !criteria.userName ||
        record.userName.toLowerCase().includes(criteria.userName.toLowerCase());
      const typeMatch = criteria.eventTypes.length === 0 || criteria.eventTypes.includes(record.eventType);
      const statusMatch = criteria.eventStatuses.length === 0 || criteria.eventStatuses.includes(record.eventStatus);

      return inRange && appMatch && userMatch && typeMatch && statusMatch;
    });

    return of(result).pipe(delay(350));
  }
}
