import { google } from 'googleapis';

/**
 * Load OAuth 2.0 client using environment variables
 */
export const getGmailClient = async () => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing Google OAuth environment variables. Please check your .env file.');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground' // Default redirect URI for refresh tokens
    );

    // Set the refresh token so it can automatically fetch access tokens
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
  } catch (error) {
    console.error('❌ Gmail Auth Error:', error.message);
    throw error;
  }
};

export default {
  getGmailClient,
};
