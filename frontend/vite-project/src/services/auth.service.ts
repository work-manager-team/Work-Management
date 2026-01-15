import { API_URL } from '../config';

interface LoginRequest {
  identifier: string; // email hoặc username
  password: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  status: string;
  role: string;
}

interface AuthResponse {
  statusCode: number;
  message: string;
  user: User;
  accessToken: string;
}

class AuthService {
  /**
   * Login
   * Endpoint: POST /users/login
   * Public: Yes
   */
  async login(identifier: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token và user info
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register
   * Endpoint: POST /users
   * Public: Yes
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }

      // Save token và user info
      if (responseData.accessToken) {
        localStorage.setItem('accessToken', responseData.accessToken);
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }

      return responseData;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Logout
   * Endpoint: POST /auth/logout
   * Public: Yes
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
