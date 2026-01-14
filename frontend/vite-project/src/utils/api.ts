/**
 * API Helper utility for authenticated requests
 */

export const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

export const apiCall = async (
    url: string,
    options?: RequestInit
): Promise<Response> => {
    const token = localStorage.getItem('accessToken');

    // Check if token is missing and log warning
    if (!token) {
        console.warn('No authentication token found. API request may fail with 401/403 error.');
    }

    const defaultOptions: RequestInit = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options?.headers || {}),
        },
    };

    const response = await fetch(url, defaultOptions);

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
        // Clear stored credentials
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Redirect to login
        window.location.href = '/login';
    }

    // Handle 403 Forbidden - usually means missing/invalid permissions
    if (response.status === 403) {
        console.error('Access forbidden. Check your authentication token and permissions.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    return response;
};
