export interface CalendarEventPayloads {
  SYNC_GOOGLE_CALENDAR: {
    crmEventId: string;
  };
  DELETE_GOOGLE_CALENDAR_EVENT: {
    googleEventId: string;
  };
}
