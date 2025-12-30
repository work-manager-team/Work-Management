
const API_BASE_URL = 'http://localhost:3000';
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  avatarUrl: string
}

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface RegisterResponse {
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    avatarUrl: string;
  };
  message: string;
}

class UserAuthService {
  /** 
   * Login user
   * @param credentials - Email/username and password
   * @returns Login response with user data and tokens
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data and tokens in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userId', data.user.id.toString());
      }

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new  user
   * @param registerData - User registration data
   * @returns Registration response
   */
  async register(registerData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registerData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Check if user is logged in
   */
  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    return !!(user && token);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      return data.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }
}

export default new UserAuthService();