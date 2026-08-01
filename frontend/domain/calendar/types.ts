export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string; // ISO 8601 string
    date?: string; // YYYY-MM-DD string for all-day events
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  colorId?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  extendedProperties?: {
    private?: {
      crmEventId?: string;
    };
  };
}

export interface GoogleCalendarListEntry {
  id: string;
  summary: string;
  primary?: boolean;
}
