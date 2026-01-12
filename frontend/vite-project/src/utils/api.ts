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

    return response;
};
