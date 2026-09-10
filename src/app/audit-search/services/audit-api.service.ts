import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import apiResponse from './api-response.json';
import { AuditRecord, AuditSearchCriteria, ClaimInformation, EventStatus, EventType } from '../models/audit-record.model';

interface RawAuditResponse {
  requestTimestamp: number;
  userId: string;
  firstName: string;
  lastName: string;
  ipAddress: string;
  eventType: string;
  applicationName: string;
  businessFunction: string;
  status: string;
  correlationId: string;
  eventData: {
    ssn: string;
    claimantAddress: string;
    claimantIdentifier: string;
    claimantName: string;
    state: string;
    todaysDate: string;
    returnCode: string;
    returnCodeDescription: string;
    claimList: Array<Record<string, unknown>>;
  };
}

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  search(criteria: AuditSearchCriteria): Observable<AuditRecord[]> {
    const records = (apiResponse as RawAuditResponse[])
      .map(response => this.mapResponse(response, criteria));
    const start = new Date(`${criteria.startDate}T00:00:00`);
    const end = new Date(`${criteria.endDate}T23:59:59`);

    const result = records.filter(record => {
      const eventDate = new Date(`${record.eventDate}T${record.eventTime}`);
      const inRange = eventDate >= start && eventDate <= end;
      const appMatch = !criteria.applicationName ||
        record.applicationName.toLowerCase().includes(criteria.applicationName.toLowerCase());
      
      // Match first name or last name from userName (format: "First Last")
      let nameMatch = true;
      if (criteria.firstName || criteria.lastName) {
        const nameParts = record.userName.split(' ');
        const first = nameParts[0]?.toLowerCase() || '';
        const last = nameParts[1]?.toLowerCase() || '';
        
        const firstMatch = !criteria.firstName || first.includes(criteria.firstName.toLowerCase());
        const lastMatch = !criteria.lastName || last.includes(criteria.lastName.toLowerCase());
        nameMatch = firstMatch && lastMatch;
      }
      
      const typeMatch = !criteria.eventType || criteria.eventType === record.eventType;
      const statusMatch = !criteria.eventStatus || criteria.eventStatus === record.eventStatus;

      return inRange && appMatch && nameMatch && typeMatch && statusMatch;
    });

    return of(result).pipe(delay(350));
  }

  private mapResponse(response: RawAuditResponse, criteria: AuditSearchCriteria): AuditRecord {
    const eventDate = new Date(response.requestTimestamp * 1000);
    const eventData = response.eventData;
    const employerChargeDetails = eventData.claimList.flatMap(claim => {
      const charges = claim['employerChargeDetails'];
      return Array.isArray(charges) ? charges as Array<Record<string, unknown>> : [];
    });
    const claimantInformation: ClaimInformation = {
      ssn: eventData.ssn,
      claimantName: eventData.claimantName,
      claimantAddress: eventData.claimantAddress,
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
