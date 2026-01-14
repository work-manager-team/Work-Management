import { AxiosError } from 'axios';
import { ApiError } from './types';

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    
    // Return custom error message if available
    if (apiError?.message) {
      return apiError.message;
    }

    // Return validation errors if available
    if (apiError?.errors) {
      const firstError = Object.values(apiError.errors)[0];
      return firstError?.[0] || 'Validation error';
    }

    // Return generic error based on status
    switch (error.response?.status) {
      case 400:
        return 'Bad request - Please check your input';
      case 401:
        return 'Unauthorized - Please login again';
      case 403:
        return 'Forbidden - You do not have permission';
      case 404:
        return 'Not found - Resource does not exist';
      case 500:
        return 'Server error - Please try again later';
      default:
        return error.message || 'An error occurred';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && error.message === 'Network Error';
  }
  return false;
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
};