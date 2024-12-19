import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: {
    action?: string;
    to?: string;
    subject?: string;
    body?: string;
  };

  try {
    body = await req.json();
  } catch (err) {
    console.error('ERROR: Failed to parse JSON:', err);
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { action, to, subject, body: emailBody } = body;

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    console.error('ERROR: Missing Google service account credentials.');
    return NextResponse.json({ error: 'Missing service account credentials' }, { status: 500 });
  }

  // Specify the user to impersonate - this must be a valid Gmail user in your domain
  const userToImpersonate = "altruistxix@gmail.com"; 

  let auth;
  try {
    auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      undefined,
      (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
      userToImpersonate
    );
  } catch (err: any) {
    console.error('ERROR: Failed to initialize Google Auth JWT:', err);
    return NextResponse.json({ error: 'Failed to initialize Google Auth' }, { status: 500 });
  }

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    if (action === 'send') {
      if (!to || !subject || !emailBody) {
        return NextResponse.json({ error: 'Missing required fields for send action' }, { status: 400 });
      }

      const rawMessage = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        emailBody
      ].join('\n');

      const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return NextResponse.json({ success: true, messageId: res.data.id }, { status: 200 });
    } else if (action === 'list') {
      const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 5,
        labelIds: ['INBOX'],
      });

      const messages = res.data.messages || [];
      return NextResponse.json({ messages }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('ERROR interacting with Gmail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
