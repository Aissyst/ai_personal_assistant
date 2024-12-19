import { NextResponse, NextRequest } from 'next/server';
import { google } from 'googleapis';

export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
    try {
      const orderDetails = await request.json();
      console.log(orderDetails);
  
      const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } = process.env;
  
      if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
        throw new Error('Missing Google Sheets configuration in environment variables.');
      }
  
      const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
      console.log('Authentication successful- private key.');
      if (!privateKey || !GOOGLE_CLIENT_EMAIL) {
        console.error('Missing Google credentials.');
        return new Response('Missing credentials', { status: 500 });
      }
      // console.log(GOOGLE_CLIENT_EMAIL);
      // console.log(GOOGLE_PRIVATE_KEY);
      // console.log(GOOGLE_SHEET_ID);
  
      const auth = new google.auth.JWT(
        GOOGLE_CLIENT_EMAIL,
        undefined,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets']
      );
  
      console.log('Authenticating with Google Sheets API...');
      const tokenResponse = await auth.authorize();
      console.log('Auth token response:', tokenResponse);
      console.log('Authentication successful.');
  
      const sheets = google.sheets({ version: 'v4', auth });
  
      const values = orderDetails.items.map((item: any) => [
        item.person_name,
        item.date,
        item.service_name,
        item.timeslot,
        item.specialInstructions || '',
        orderDetails.totalAmount
      ]);
  
      console.log('Appending values to Google Sheet...');
      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
  
      console.log('Sheet updated successfully.');
      return NextResponse.json({ message: 'Sheet updated successfully' });
    } catch (error: any) {
      console.error('Failed to update Google Sheet:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  