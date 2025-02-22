import TokenService from '../lib/auth/tokens';
import { LoginCredentials, RegisterData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

interface AdminLoginCredentials {
  email: string;
  password: string;
}

export const register = async (data: RegisterData): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { error: result };
    }
    
    // Store tokens
    TokenService.setTokens(result);
    document.cookie = `accessToken=${result.accessToken}; path=/`;
    document.cookie = `refreshToken=${result.refreshToken}; path=/`;
    
    return { data: result };
  } catch (error) {
    return { 
      error: {
        message: "An unexpected error occurred",
        error: "NetworkError",
        statusCode: 500
      }
    };
  }
};

export const login = async (credentials: LoginCredentials): Promise<ApiResponse<any>> => {
  try {
    console.log('Making login request with credentials:', { ...credentials, password: '***' });
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    
    const result = await response.json();
    console.log('Login response:', result);
    
    if (!response.ok) {
      console.error('Login failed:', result);
      return { error: result };
    }
    
    // Store tokens
    console.log('Storing tokens...');
    // Set secure cookies first
    document.cookie = `accessToken=${result.accessToken}; path=/; max-age=3600; samesite=strict`;
    document.cookie = `refreshToken=${result.refreshToken}; path=/; max-age=86400; samesite=strict`;
    // Then store in localStorage via TokenService
    TokenService.setTokens(result);
    console.log('Tokens stored successfully');
    
    return { data: result };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      error: {
        message: "An unexpected error occurred",
        error: "NetworkError",
        statusCode: 500
      }
    };
  }
};

export const adminLogin = async (credentials: AdminLoginCredentials): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { error: result };
    }
    
    // Store tokens
    TokenService.setTokens(result);
    document.cookie = `accessToken=${result.accessToken}; path=/`;
    document.cookie = `refreshToken=${result.refreshToken}; path=/`;
    
    return { data: result };
  } catch (error) {
    return { 
      error: {
        message: "An unexpected error occurred",
        error: "NetworkError",
        statusCode: 500
      }
    };
  }
};

export const logout = () => {
  TokenService.clearTokens();
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
};

