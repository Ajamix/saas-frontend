interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface DecodedToken {
  email: string;
  sub: string;
  tenantId: string;
  isSuperAdmin: boolean;
  hasSetupProfile: boolean;
  permissions: Record<string, string[]>;
  iat: number;
  exp: number;
}

const isClient = typeof window !== 'undefined';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static refreshPromise: Promise<TokenResponse> | null = null;

  static setTokens(tokens: TokenResponse) {
    if (!isClient) return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    
    // Set cookies for middleware
    document.cookie = `accessToken=${tokens.accessToken}; path=/`;
    document.cookie = `refreshToken=${tokens.refreshToken}; path=/`;
  }

  static getAccessToken(): string | null {
    if (!isClient) return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (!isClient) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens() {
    if (!isClient) return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }

  static decodeToken(token: string): DecodedToken | null {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  static isTokenValid(token: string | null): boolean {
    if (!token) return false;
    const decoded = this.decodeToken(token);
    if (!decoded) return false;
    // Consider token as expired if it's within 60 seconds of expiry
    return decoded.exp * 1000 > Date.now() + 60000;
  }

  static async refreshTokens(): Promise<TokenResponse> {
    if (this.refreshPromise) {
      return this.refreshPromise; // If a refresh is in progress, return the existing Promise
    }
  
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
  
    // Store the promise in a local variable before assigning it to prevent cycles
    const refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'refresh-token': refreshToken
          },
        });
  
        if (!response.ok) {
          throw new Error(`Failed to refresh token: ${response.status}`);
        }
  
        const tokens = await response.json();
        this.setTokens(tokens);
        return tokens;
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Only clear tokens on 401 (Unauthorized) or 403 (Forbidden)
        if (error instanceof Response && (error.status === 401 || error.status === 403)) {
          this.clearTokens();
        }
  
        throw new Error('Token refresh failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        this.refreshPromise = null; // Ensure future requests create a new Promise
      }
    })();
  
    this.refreshPromise = refreshPromise;
    return refreshPromise;
  }
  
  
  static async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    
    // If token is valid, return it
    if (this.isTokenValid(accessToken)) {
      return accessToken;
    }
  
    try {
      // Attempt to refresh tokens
      const tokens = await this.refreshTokens();
      return tokens.accessToken;
    } catch (error) {
      console.error('Failed to get valid access token:', error);
  
      // Only clear tokens if refreshToken is explicitly missing (not due to fetch failure)
      if (!this.getRefreshToken()) {
        this.clearTokens();
      }
  
      return null;
    }
  }
  
  
  static isAuthenticated(): boolean {
    if (!isClient) return false;
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken && (this.isTokenValid(accessToken) || this.isTokenValid(refreshToken)));
  }

  static isAdmin(): boolean {
    if (!isClient) return false;
    const token = this.getAccessToken();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    return decoded?.isSuperAdmin ?? false;
  }

  static getTenantId(): string | null {
    if (!isClient) return null;
    const token = this.getAccessToken();
    if (!token) return null;
    const decoded = this.decodeToken(token);
    return decoded?.tenantId ?? null;
  }
}

export type { TokenResponse, DecodedToken };
export default TokenService; 