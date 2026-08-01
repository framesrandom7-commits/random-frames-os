import { google } from 'googleapis';
import { CredentialManager } from '@/domain/integrations/credential-manager';
import { DRIVE_CONSTANTS } from '@/domain/drive/constants';

export async function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured in .env');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  const settings = await CredentialManager.getCredentials(DRIVE_CONSTANTS.PROVIDER_ID);

  if (!settings || !settings.accessToken) {
    throw new Error('Google Drive integration not connected');
  }

  oauth2Client.setCredentials({
    access_token: settings.accessToken,
    refresh_token: settings.refreshToken ? CredentialManager.decrypt(settings.refreshToken) : undefined,
    expiry_date: settings.tokenExpiry?.getTime(),
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await CredentialManager.updateCredentials(
        DRIVE_CONSTANTS.PROVIDER_ID,
        tokens.access_token,
        tokens.refresh_token,
        tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
      );
      
      // Also update calendar if we share credentials
      await CredentialManager.updateCredentials(
        'GOOGLE_CALENDAR',
        tokens.access_token,
        tokens.refresh_token,
        tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
      );
    }
  });

  return oauth2Client;
}

export async function getDriveService() {
  const auth = await getGoogleOAuthClient();
  return google.drive({ version: 'v3', auth });
}

export async function getCalendarService() {
  const auth = await getGoogleOAuthClient();
  return google.calendar({ version: 'v3', auth });
}
