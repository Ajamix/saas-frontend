import TokenService from '@/app/lib/auth/tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class AuthClient {
  private static async getHeaders(): Promise<HeadersInit> {
    try {
      const accessToken = await TokenService.getValidAccessToken();
      
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };
    } catch (error) {
      // Only redirect if we're in the browser
      if (typeof window !== 'undefined') {
        TokenService.clearTokens();
        window.location.href = '/auth/login';
      }
      throw error;
    }
  }

  private static async handleResponse(response: Response) {
    if (response.ok) {
      return response.json();
    }

    if (response.status === 401) {
      try {
        // Try to refresh the token one more time
        const accessToken = await TokenService.getValidAccessToken();
        if (accessToken) {
          // Retry the original request with the new token
          const retryResponse = await fetch(response.url, {
            ...response,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
      
      // If we get here, both the original request and retry failed
      TokenService.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  static async get(endpoint: string) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, { headers });
      return this.handleResponse(response);
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  static async post(endpoint: string, data?: any) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  static async put(endpoint: string, data?: any) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  static async patch(endpoint: string, data?: any) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('PATCH request failed:', error);
      throw error;
    }
  }

  static async delete(endpoint: string) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }
}

export default AuthClient; 