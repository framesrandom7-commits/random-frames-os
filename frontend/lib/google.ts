import { google } from 'googleapis';
import { prisma } from './prisma';
import { decryptToken, encryptToken } from './crypto';

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

  // We fetch GOOGLE_DRIVE settings, assuming they use the same account for Calendar.
  // In a robust multi-user app, we'd pass the userId. For this single-tenant OS, we take the first connected.
  const settings = await prisma.integrationSettings.findUnique({
    where: { provider: 'GOOGLE_DRIVE' }
  });

  if (!settings || !settings.accessToken) {
    throw new Error('Google Drive integration not connected');
  }

  oauth2Client.setCredentials({
    access_token: settings.accessToken,
    refresh_token: settings.refreshToken ? decryptToken(settings.refreshToken) : undefined,
    expiry_date: settings.tokenExpiry?.getTime(),
  });

  // Handle token refresh automatically
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      const updateData: any = {
        accessToken: tokens.access_token,
      };
      if (tokens.expiry_date) {
        updateData.tokenExpiry = new Date(tokens.expiry_date);
      }
      if (tokens.refresh_token) {
        updateData.refreshToken = encryptToken(tokens.refresh_token);
      }

      await prisma.integrationSettings.updateMany({
        where: { provider: { in: ['GOOGLE_DRIVE', 'GOOGLE_CALENDAR'] } },
        data: updateData,
      });
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
