import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const CALENDAR_ID = "altruistxix@gmail.com"

export async function POST(req: NextRequest) {
  console.log('DEBUG: Entered /api/updateCalendar POST method.');

  let body: {
    action?: string;
    eventData?: any;
    eventId?: string;
    updatedEventData?: any;
  };

  try {
    body = await req.json();
  } catch (err) {
    console.error('ERROR: Failed to parse JSON:', err);
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { action, eventData, eventId, updatedEventData } = body;
  console.log('DEBUG: Request body parsed:', { action, eventData, eventId, updatedEventData });

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    console.error('ERROR: Missing Google service account credentials.');
    return NextResponse.json({ error: 'Missing service account credentials' }, { status: 500 });
  }

  let auth;
  try {
    auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      undefined,
      (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar.events']
    );
  } catch (err: any) {
    console.error('ERROR: Failed to initialize Google Auth JWT:', err);
    return NextResponse.json({ error: 'Failed to initialize Google Auth' }, { status: 500 });
  }

  const calendar = google.calendar({ version: 'v3', auth });
  console.log('DEBUG: Calendar client initialized successfully.');

  try {
    if (action === 'get') {
      console.log('DEBUG: Performing "get" action on calendar.');
      const response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        singleEvents: true,
        orderBy: 'startTime',
      });
      const events = response.data.items || [];
      console.log('DEBUG: Fetched events count:', events.length);
      return NextResponse.json({ events }, { status: 200 });

    } else if (action === 'add') {
      console.log('DEBUG: Performing "add" action with eventData:', eventData);
      if (!eventData || !eventData.summary || !eventData.start || !eventData.end) {
        console.warn('WARN: Invalid event data for adding event.');
        console.log('DEBUG: Fetched events event data:', eventData);
        console.log('DEBUG: Fetched events summary:', eventData.summary);
        console.log('DEBUG: Fetched events startdate:', eventData.start);
        console.log('DEBUG: Fetched events end date:', eventData.end);
        return NextResponse.json({ error: 'Invalid event data for adding event' }, { status: 400 });
      }

      const newEvent = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: eventData,
      });
      console.log('DEBUG: Event added successfully with ID:', newEvent.data.id);
      return NextResponse.json({ success: true, event: newEvent.data }, { status: 200 });

    } else if (action === 'edit') {
      console.log('DEBUG: Performing "edit" action for eventId:', eventId);
      if (!eventId || !eventData) {
        console.warn('WARN: Missing eventId or eventData for edit action.');
        return NextResponse.json({ error: 'Missing eventId or eventData' }, { status: 400 });
      }

      const updatedEvent = await calendar.events.patch({
        calendarId: CALENDAR_ID,
        eventId: eventId,
        requestBody: eventData,
      });
      console.log('DEBUG: Event edited successfully with ID:', updatedEvent.data.id);
      return NextResponse.json({ success: true, event: updatedEvent.data }, { status: 200 });

    } else if (action === 'delete') {
      console.log('DEBUG: Performing "delete" action for eventId:', eventId);
      if (!eventId) {
        console.warn('WARN: Missing eventId for deletion.');
        return NextResponse.json({ error: 'Missing eventId for deletion' }, { status: 400 });
      }

      await calendar.events.delete({
        calendarId: CALENDAR_ID,
        eventId: eventId,
      });
      console.log('DEBUG: Event deleted successfully.');
      return NextResponse.json({ success: true }, { status: 200 });

    } else {
      console.warn('WARN: Received invalid action:', action);
      return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('ERROR: Exception occurred while interacting with Google Calendar:', error);
    return NextResponse.json({
      error: 'An error occurred while processing your request.',
      details: error.message
    }, { status: 500 });
  }
}
