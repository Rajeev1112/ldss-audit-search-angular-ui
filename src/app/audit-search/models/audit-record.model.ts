export type EventType = 'Read' | 'Print' | 'Retrieve';
export type EventStatus = 'Success' | 'Failed';

export interface ClaimInformation {
  ssn: string;
  firstName: string;
  lastName: string;
  claimantName: string;
  claimantAddress: string;
  claimantNameAndAddress: string;
  claimantIdentifier: string;
  state: string;
  todaysDate: string;
  returnCode: string;
  returnCodeDescription: string;
  claims: Array<Record<string, unknown>>;
  employerChargeDetails: Array<Record<string, unknown>>;
}

export interface AuditRecord {
  id: string;
  eventDate: string;
  eventTime: string;
  userId: string;
  userName: string;
  eventType: EventType;
  eventStatus: EventStatus;
  applicationName: string;
  businessFunction: string;
  ipAddress: string;
  requestData: {
    ssn: string;
    startDate: string;
    endDate: string;
  };
  responseData: {
    claimantInformation: ClaimInformation;
  };
}

export interface AuditSearchCriteria {
  startDate: string;
  endDate: string;
  applicationName: string;
  firstName: string;
  lastName: string;
  eventType: EventType | '';
  eventStatus: EventStatus | '';
}
