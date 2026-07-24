export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope: string;
}

export abstract class OAuthProvider {
  /**
   * Return the URL to redirect the user to for OAuth consent.
   */
  public abstract getAuthorizationUrl(): string;

  /**
   * Exchange the authorization code for an access token.
   */
  public abstract exchangeCodeForToken(code: string): Promise<OAuthTokenResponse>;

  /**
   * Refresh an expired access token using the refresh token.
   */
  public abstract refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse>;
}
