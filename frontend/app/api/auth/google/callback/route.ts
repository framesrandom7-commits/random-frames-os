import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { encryptToken } from '@/lib/crypto';
import { verifySession as getSession } from '@/lib/auth';
import { validateStorageEnvironment, getRequiredEnv } from '@/lib/env';
import { Logger } from '@/lib/logger';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    Logger.warn('OAuth callback missing code', { module: 'OAuth', operation: 'auth_callback', status: 'WARN' });
    return NextResponse.redirect(new URL('/settings/storage?error=NoCodeProvided', request.url));
  }

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

    const session = await getSession();
    if (!session || !session.userId) {
      Logger.warn('OAuth callback missing session', { module: 'OAuth', operation: 'auth_callback', status: 'WARN' });
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { tokens } = await oauth2Client.getToken(code);
    
    const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null;
    const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    await prisma.integrationSettings.upsert({
      where: { provider: 'GOOGLE_DRIVE' },
      update: {
        accessToken: tokens.access_token,
        ...(encryptedRefreshToken ? { refreshToken: encryptedRefreshToken } : {}),
        tokenExpiry,
        userId: session.userId,
        syncStatus: 'CONNECTED'
      },
      create: {
        provider: 'GOOGLE_DRIVE',
        accessToken: tokens.access_token,
        refreshToken: encryptedRefreshToken,
        tokenExpiry,
        userId: session.userId,
        syncStatus: 'CONNECTED'
      },
    });

    Logger.info('Successfully connected Google Drive', { module: 'OAuth', operation: 'auth_callback', status: 'SUCCESS' });
    return NextResponse.redirect(new URL('/settings/storage?success=Connected', request.url));
  } catch (error: any) {
    Logger.error('Failed to exchange Google OAuth code', error, { module: 'OAuth', operation: 'auth_callback', status: 'ERROR' });
    return NextResponse.redirect(new URL('/settings/storage?error=ExchangeFailed', request.url));
  }
}
