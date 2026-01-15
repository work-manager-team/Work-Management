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
    let token = localStorage.getItem('accessToken');

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

    let response = await fetch(url, defaultOptions);

    // Handle 401 Unauthorized - token might be expired, try to refresh
    if (response.status === 401) {
        console.warn('Token expired (401). Attempting to refresh...');
        
        try {
            // Try to refresh token
            const refreshResponse = await fetch('https://work-management-chi.vercel.app/users/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: localStorage.getItem('refreshToken'),
                }),
            });

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                
                // Update tokens
                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                // Retry original request with new token
                const retryOptions: RequestInit = {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${data.accessToken}`,
                        ...(options?.headers || {}),
                    },
                };

                response = await fetch(url, retryOptions);
                console.log('Request retried after token refresh:', response.status);
                
                return response;
            } else {
                throw new Error('Failed to refresh token');
            }
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // If refresh fails, logout and redirect
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            // Store redirect flag and let page handle cleanup before redirect
            sessionStorage.setItem('authExpired', 'true');
            
            // Redirect after a longer delay to allow component to unmount
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
            
            // Return a 401 response to indicate auth failed
            return new Response(JSON.stringify({ error: 'Session expired' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // Handle 403 Forbidden - usually means missing/invalid permissions
    if (response.status === 403) {
        console.error('Access forbidden. Check your authentication token and permissions.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        sessionStorage.setItem('authExpired', 'true');
        
        setTimeout(() => {
            window.location.href = '/login';
        }, 500);
    }

    return response;
};