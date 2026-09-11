import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuditRecord, AuditSearchCriteria, ClaimInformation, EventStatus, EventType } from '../models/audit-record.model';

interface RawAuditResponse {
  requestTimestamp: string;
  userId: string;
  firstName: string;
  lastName: string;
  ipAddress: string;
  eventType: string;
  applicationName: string;
  businessFunction: string;
  status: string;
  correlationId: string;
  eventData: string;
}

interface RawEventData {
    ssn: string;
    firstName: string;
    lastName: string;
    claimantAddress: string;
    claimantIdentifier: string;
    claimantName: string;
    claimantNameAndAddress: string;
    state: string;
    todaysDate: string;
    returnCode: string;
    returnCodeDescription: string;
    claimList: Array<Record<string, unknown>>;
}

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/auditSearch';

  search(criteria: AuditSearchCriteria): Observable<AuditRecord[]> {
    return this.http.post<RawAuditResponse | RawAuditResponse[]>(this.apiUrl, criteria).pipe(
      map(response => {
        const responses = Array.isArray(response) ? response : [response];
        return responses
          .map(item => this.mapResponse(item, criteria))
          .filter(record => this.matchesCriteria(record, criteria));
      })
    );
  }

  private matchesCriteria(record: AuditRecord, criteria: AuditSearchCriteria): boolean {
    const start = new Date(`${criteria.startDate}T00:00:00`);
    const end = new Date(`${criteria.endDate}T23:59:59`);
    const eventDate = new Date(`${record.eventDate}T${record.eventTime}`);
    const inRange = eventDate >= start && eventDate <= end;
    const appMatch = !criteria.applicationName ||
      record.applicationName.toLowerCase().includes(criteria.applicationName.toLowerCase());

    const [first = '', last = ''] = record.userName.toLowerCase().split(' ');
    const firstMatch = !criteria.firstName || first.includes(criteria.firstName.toLowerCase());
    const lastMatch = !criteria.lastName || last.includes(criteria.lastName.toLowerCase());
    const typeMatch = !criteria.eventType || criteria.eventType === record.eventType;
    const statusMatch = !criteria.eventStatus || criteria.eventStatus === record.eventStatus;

    return inRange && appMatch && firstMatch && lastMatch && typeMatch && statusMatch;
  }

  private mapResponse(response: RawAuditResponse, criteria: AuditSearchCriteria): AuditRecord {
    const eventDate = new Date(response.requestTimestamp);
    const eventData = JSON.parse(response.eventData) as RawEventData;
    const employerChargeDetails = eventData.claimList.flatMap(claim => {
      const charges = claim['employerChargeDetails'];
      return Array.isArray(charges) ? charges as Array<Record<string, unknown>> : [];
    });
    const claimantInformation: ClaimInformation = {
      ssn: eventData.ssn,
      firstName: eventData.firstName,
      lastName: eventData.lastName,
      claimantName: eventData.claimantName,
      claimantAddress: eventData.claimantAddress,
      claimantNameAndAddress: eventData.claimantNameAndAddress,
      claimantIdentifier: eventData.claimantIdentifier,
      state: eventData.state,
      todaysDate: eventData.todaysDate,
      returnCode: eventData.returnCode,
      returnCodeDescription: eventData.returnCodeDescription,
      claims: eventData.claimList,
      employerChargeDetails
    };

    return {
      id: response.correlationId,
      eventDate: eventDate.toISOString().slice(0, 10),
      eventTime: eventDate.toISOString().slice(11, 19),
      userId: response.userId,
      userName: `${response.firstName} ${response.lastName}`,
      eventType: this.toEventType(response.eventType),
      eventStatus: this.toEventStatus(response.status),
      applicationName: response.applicationName,
      businessFunction: response.businessFunction,
      ipAddress: response.ipAddress,
      requestData: {
        ssn: eventData.ssn,
        startDate: criteria.startDate,
        endDate: criteria.endDate
      },
      responseData: { claimantInformation }
    };
  }

  private toEventType(eventType: string): EventType {
    return eventType.toLowerCase().replace(/^./, character => character.toUpperCase()) as EventType;
  }

  private toEventStatus(status: string): EventStatus {
    return status.toLowerCase().replace(/^./, character => character.toUpperCase()) as EventStatus;
  }
}
