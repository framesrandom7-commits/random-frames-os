import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { validateStorageEnvironment, getRequiredEnv } from '@/lib/env';
import { Logger } from '@/lib/logger';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // For creating and managing files we create
  'https://www.googleapis.com/auth/drive',      // Full drive access if needed for complete DAM
];

export async function GET() {
  try {
    validateStorageEnvironment();
    
    const clientId = getRequiredEnv('GOOGLE_CLIENT_ID');
    const clientSecret = getRequiredEnv('GOOGLE_CLIENT_SECRET');
    const redirectUri = getRequiredEnv('GOOGLE_REDIRECT_URI');

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Important: forces a refresh token
      scope: SCOPES,
      prompt: 'consent',      // Force consent to always get a refresh token
    });
    
    Logger.info('Initiating Google OAuth flow', { module: 'OAuth', operation: 'auth_redirect', status: 'SUCCESS' });
    return NextResponse.redirect(url);
  } catch (error: any) {
    Logger.error('Failed to initiate OAuth', error, { module: 'OAuth', operation: 'auth_redirect', status: 'ERROR' });
    return NextResponse.json({ error: error?.message || 'OAuth configuration error' }, { status: 500 });
  }
}
