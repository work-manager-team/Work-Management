/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Error Response
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

/**
 * Auth Response
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}
