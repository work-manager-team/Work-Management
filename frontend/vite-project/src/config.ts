// Environment configuration for Vite
// Vite uses import.meta.env.VITE_* instead of process.env.REACT_APP_*

export const API_URL = import.meta.env.VITE_API_URL || 'https://work-management-chi.vercel.app';

// WebSocket Server URL - kết nối tới notification service
// Endpoint đầy đủ: https://work-management-4c6a.onrender.com/notifications
export const WS_URL = import.meta.env.VITE_WS_URL || 'https://work-management-4c6a.onrender.com';

// Validate required environment variables in production
if (import.meta.env.PROD && (!API_URL || !WS_URL)) {
  throw new Error('Missing required environment variables: VITE_API_URL, VITE_WS_URL');
}
