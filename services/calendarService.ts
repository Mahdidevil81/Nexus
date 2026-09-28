import { getAccessToken } from './gmailService';

export interface CalendarEventDateTime {
  dateTime?: string; // ISO 8601
  date?: string; // YYYY-MM-DD for all-day events
  timeZone?: string;
}

export interface CalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: CalendarEventDateTime;
  end: CalendarEventDateTime;
  status?: string;
  htmlLink?: string;
  attendees?: CalendarAttendee[];
  hangoutLink?: string; // Google Meet link if generated
  created?: string;
  updated?: string;
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: { email: string }[];
}

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

/**
 * List upcoming events from primary calendar
 */
export const listCalendarEvents = async (maxResults = 25, query = ''): Promise<CalendarEvent[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google to view calendar.');
  }

  const url = new URL(CALENDAR_API_BASE);
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  
  // By default, list events starting from the start of today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  url.searchParams.set('timeMin', today.toISOString());

  if (query.trim()) {
    url.searchParams.set('q', query.trim());
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch calendar events (${response.status})`);
  }

  const data = await response.json();
  return (data.items || []) as CalendarEvent[];
};

/**
 * Insert a new event into Google Calendar
 * Note: Caller UI MUST show a confirmation dialog before executing mutations.
 */
export const createCalendarEvent = async (eventInput: CalendarEventInput): Promise<CalendarEvent> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google to create calendar event.');
  }

  const response = await fetch(CALENDAR_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(eventInput),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to schedule event (${response.status})`);
  }

  return (await response.json()) as CalendarEvent;
};

/**
 * Update an existing calendar event
 * Note: Caller UI MUST show a confirmation dialog before executing mutations.
 */
export const updateCalendarEvent = async (eventId: string, eventInput: Partial<CalendarEventInput>): Promise<CalendarEvent> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google.');
  }

  const url = `${CALENDAR_API_BASE}/${encodeURIComponent(eventId)}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(eventInput),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to update event (${response.status})`);
  }

  return (await response.json()) as CalendarEvent;
};

/**
 * Delete a calendar event
 * Note: Caller UI MUST show a confirmation dialog before executing mutations.
 */
export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('UNAUTHORIZED: No access token available. Please sign in with Google.');
  }

  const url = `${CALENDAR_API_BASE}/${encodeURIComponent(eventId)}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete calendar event (${response.status})`);
  }
};
