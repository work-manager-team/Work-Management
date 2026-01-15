import { io, Socket } from 'socket.io-client';
const WS_URL = 'https://work-management-4c6a.onrender.com';
import userAuthService from './auth.service';

export interface NotificationData {
    id?: number;
    type: string;
    title: string;
    message: string;
    userId: number;
    relatedEntityType?: string;
    relatedEntityId?: number;
    createdAt: string;
    isRead?: boolean;
}

type NotificationCallback = (notification: NotificationData) => void;

class WebSocketService {
    private socket: Socket | null = null;
    private callbacks: Set<NotificationCallback> = new Set();
    private isConnecting: boolean = false;
    private connectionAttempts: number = 0;
    private maxConnectionAttempts: number = 5;

    async connect(): Promise<void> {
        // ✅ Lấy token trực tiếp từ localStorage
        const token = localStorage.getItem('accessToken');
        const user = userAuthService.getCurrentUser();

        if (!token) {
            console.error('❌ Cannot connect to WebSocket: No token');
            return;
        }

        if (!user) {
            console.error('❌ Cannot connect to WebSocket: No user');
            return;
        }

        if (this.socket?.connected) {
            console.log('✅ WebSocket already connected');
            return;
        }

        if (this.isConnecting) {
            console.log('⏳ WebSocket connection in progress...');
            return;
        }

        this.isConnecting = true;
        this.connectionAttempts++;
        console.log(`🔌 Connecting to WebSocket (attempt ${this.connectionAttempts}):`, WS_URL);
        console.log('👤 User ID:', user.id);

        try {
            // Connect to Socket.IO server with /notifications namespace
            const wsUrlWithNamespace = `${WS_URL}/notifications`;
            console.log('🔌 Connecting to:', wsUrlWithNamespace);

            // Decode token to get userId from 'sub' field
            const tokenPayload = this.decodeToken(token);
            const userId = tokenPayload?.sub || user.id;
            console.log('🔑 Token userId (sub):', userId);
            console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

            this.socket = io(wsUrlWithNamespace, {
                auth: {
                    token: token, // BẮT BUỘC: Token KHÔNG CẦN prefix "Bearer "
                },
                transports: ['websocket', 'polling'], // Fallback sang polling nếu WebSocket fail
                reconnection: true,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
                reconnectionAttempts: Infinity,  // Cho phép reconnect vô hạn (user có thể ngắt bằng disconnect)
                timeout: 45000,  // Tăng timeout cho cold start (server có thể mất 20-30s)
                forceNew: false,  // Không force new connection, reuse nếu có
            });

            this.setupEventHandlers();
        } catch (error) {
            console.error('❌ Failed to initialize Socket.IO:', error);
            this.isConnecting = false;
        }
    }

    /**
     * Decode JWT token to extract payload
     */
    private decodeToken(token: string): any {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.warn('⚠️ Invalid token format');
                return null;
            }

            const decoded = JSON.parse(atob(parts[1]));
            console.log('🔑 Token payload:', decoded);
            return decoded;
        } catch (error) {
            console.error('❌ Failed to decode token:', error);
            return null;
        }
    }

    private setupEventHandlers(): void {
        if (!this.socket) return;

        const user = userAuthService.getCurrentUser();

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO server');
            console.log('📍 Socket ID:', this.socket?.id);
            this.isConnecting = false;
            this.connectionAttempts = 0; // Reset attempts on successful connection
            console.log('📤 Waiting for server confirmation...');
        });

        // Listen for connection confirmation from server
        this.socket.on('connected', (data: { message: string; userId: number }) => {
            console.log('✅ Server confirmed connection:', data);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from Socket.IO:', reason);
            this.isConnecting = false;
        });

        // Listen for notification events - backend uses 'notification' event
        this.socket.on('notification', (notification: NotificationData) => {
            console.log('🔔 Received notification:', notification);
            this.callbacks.forEach(callback => callback(notification));
        });

        // Listen for notification marked as read (sync across devices)
        this.socket.on('notification:marked_read', (data: { notificationId: number }) => {
            console.log('📖 Notification marked as read:', data.notificationId);
        });

        this.socket.on('error', (error) => {
            console.error('❌ Socket.IO error:', error);
        });

        this.socket.on('connect_error', (error) => {
            console.warn('⚠️ Socket.IO connection error:', error.message || error);
            // Lỗi connection sẽ tự động reconnect (reconnectionAttempts: Infinity)
            // Không cần ngắt connection ở đây
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnected to Socket.IO after ${attemptNumber} attempts`);
            this.isConnecting = false;
            this.connectionAttempts = 0;
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Reconnecting attempt #${attemptNumber}...`);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('❌ Socket.IO reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Socket.IO reconnection failed after all attempts');
            this.isConnecting = false;
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.socket) {
            // Remove all listeners before disconnecting
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            this.isConnecting = false;
            this.connectionAttempts = 0; // Reset attempts on manual disconnect
            console.log('🔌 Socket.IO disconnected');
        }
    }

    /**
     * Reset connection attempts (for manual reconnect)
     */
    resetConnectionAttempts(): void {
        this.connectionAttempts = 0;
    }

    /**
     * Subscribe to notifications
     * Returns unsubscribe function
     */
    onNotification(callback: NotificationCallback): () => void {
        this.callbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.callbacks.delete(callback);
        };
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Get socket ID
     */
    getSocketId(): string | undefined {
        return this.socket?.id;
    }

    /**
     * Subscribe to project notifications
     */
    subscribeToProject(projectId: number): void {
        if (this.socket?.connected) {
            this.socket.emit('subscribe:project', { projectId });
        }
    }

    /**
     * Unsubscribe from project notifications
     */
    unsubscribeFromProject(projectId: number): void {
        if (this.socket?.connected) {
            this.socket.emit('unsubscribe:project', { projectId });
        }
    }

    /**
     * Mark notification as read via WebSocket (syncs across devices)
     */
    markNotificationRead(notificationId: number): void {
        if (this.socket?.connected) {
            this.socket.emit('notification:read', { notificationId });
        }
    }
}

export const websocketService = new WebSocketService();