const API_URL = 'https://work-management-chi.vercel.app';
import userAuthService from './auth.service';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * API Service - Wrapper for fetch with authentication
 */
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Make authenticated API request
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers || {}),
    };

    // Add auth token if not skipped
    if (!skipAuth) {
      const token = userAuthService.getAccessToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Try to refresh token
        try {
          await userAuthService.refreshToken();
          // Retry the request with new token
          const newToken = userAuthService.getAccessToken();
          if (newToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
          }
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
            ...fetchOptions,
            headers,
          });
          
          if (!retryResponse.ok) {
            throw new Error('Request failed after token refresh');
          }
          
          return await retryResponse.json();
        } catch (refreshError) {
          // If refresh fails, logout and redirect
          userAuthService.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        console.error('Access forbidden. Check your authentication token and permissions.');
        throw new Error('Forbidden');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiService();