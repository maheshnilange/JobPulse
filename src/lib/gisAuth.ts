// Google Identity Services (GIS) Token Client for Client-Side Workspace OAuth

interface TokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (err: any) => void;
          }) => TokenClient;
          hasGrantedAllScopes: (token: TokenResponse, firstScope: string, ...restScopes: string[]) => boolean;
        };
      };
    };
  }
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

const STORAGE_KEY = 'jobpulse_google_oauth_token';
const EXPIRY_KEY = 'jobpulse_google_oauth_expiry';
const REQUIRED_SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly';

export class GoogleIdentityServicesAuth {
  private static tokenClient: TokenClient | null = null;
  private static initPromise: Promise<void> | null = null;

  /**
   * Loads the Google Identity Services client script if not already present
   */
  public static async loadGisScript(): Promise<void> {
    if (window.google?.accounts?.oauth2) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services SDK')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK'));
      document.head.appendChild(script);
    });

    return this.initPromise;
  }

  /**
   * Retrieves the OAuth Client ID from backend or fallback
   */
  public static async getClientId(): Promise<string> {
    try {
      const res = await fetch('/api/auth/client-id');
      if (res.ok) {
        const data = await res.json();
        if (data.clientId) return data.clientId;
      }
    } catch (e) {
      console.warn('Could not fetch client ID from API', e);
    }
    // Environment or standard configured client
    const metaEnv = (import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID;
    return metaEnv || '';
  }

  /**
   * Prompts user with Google Consent popup to grant Gmail permissions
   */
  public static async requestAuth(clientIdOverride?: string): Promise<string> {
    await this.loadGisScript();

    const clientId = clientIdOverride || (await this.getClientId());
    if (!clientId) {
      throw new Error('Google OAuth Client ID is not configured.');
    }

    return new Promise((resolve, reject) => {
      try {
        if (!window.google?.accounts?.oauth2) {
          throw new Error('Google Identity Services SDK is not available');
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: REQUIRED_SCOPES,
          callback: (response: TokenResponse) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
              return;
            }

            if (response.access_token) {
              const expiresInMs = (response.expires_in || 3600) * 1000;
              const expiryTime = Date.now() + expiresInMs - 60000; // 1 min buffer
              localStorage.setItem(STORAGE_KEY, response.access_token);
              localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
              resolve(response.access_token);
            } else {
              reject(new Error('No access token returned from Google'));
            }
          },
          error_callback: (err) => {
            reject(err);
          }
        });

        this.tokenClient = client;
        client.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Returns current token if valid, or null if expired / missing
   */
  public static async getValidToken(): Promise<string | null> {
    const token = localStorage.getItem(STORAGE_KEY);
    const expiryStr = localStorage.getItem(EXPIRY_KEY);

    if (!token || !expiryStr) {
      return null;
    }

    const expiryTime = parseInt(expiryStr, 10);
    if (Date.now() >= expiryTime) {
      // Token expired
      this.clearToken();
      return null;
    }

    return token;
  }

  public static isAuthorized(): boolean {
    const token = localStorage.getItem(STORAGE_KEY);
    const expiryStr = localStorage.getItem(EXPIRY_KEY);
    if (!token || !expiryStr) return false;
    return Date.now() < parseInt(expiryStr, 10);
  }

  public static clearToken(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  }
}
