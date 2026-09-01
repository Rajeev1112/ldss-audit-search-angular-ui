export type EventType = 'Read' | 'Create' | 'Update' | 'Delete';
export type EventStatus = 'Success' | 'Failed';

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
    claimantInformation: string;
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
