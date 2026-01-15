import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { websocketService, NotificationData } from '../services/user/websocket.service';
import userAuthService from '../services/user/auth.service';

interface Toast {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: number;
}

interface NotificationContextType {
    toasts: Toast[];
    removeToast: (id: string) => void;
    isConnected: boolean;
    reconnect: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const toastCounterRef = useRef(0);

    // Mapping notification types to toast types
    const getToastType = (notificationType: string): 'info' | 'warning' | 'success' | 'error' => {
        switch (notificationType) {
            case 'task_assigned':
            case 'added_to_project':
            case 'project_created':
                return 'success';
            case 'task_status_changed':
            case 'sprint_status_changed':
                return 'info';
            case 'task_deleted':
            case 'sprint_deleted':
                return 'error';
            default:
                return 'info';
        }
    };

    useEffect(() => {
        const user = userAuthService.getCurrentUser();
        if (!user) {
            console.log('❌ No user found, skipping WebSocket connection');
            return;
        }

        console.log('🚀 Initializing WebSocket connection for user:', user.id);

        // Connect to WebSocket
        websocketService.connect();

        // Check connection status periodically
        const statusInterval = setInterval(() => {
            setIsConnected(websocketService.isConnected());
        }, 1000);

        // Subscribe to WebSocket notifications
        const unsubscribeNotification = websocketService.onNotification((notification: NotificationData) => {
            console.log('🔔 New notification received:', notification);

            const toastId = `toast-${++toastCounterRef.current}`;
            const newToast: Toast = {
                id: toastId,
                title: notification.title,
                message: notification.message,
                type: getToastType(notification.type),
                timestamp: Date.now(),
            };

            setToasts((prev) => [...prev, newToast]);

            // Auto-remove toast after 5 seconds
            setTimeout(() => {
                removeToast(toastId);
            }, 5000);
        });

        return () => {
            console.log('🔌 Cleaning up WebSocket connection');
            unsubscribeNotification();
            clearInterval(statusInterval);
            websocketService.disconnect();
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const reconnect = () => {
        console.log('🔄 Manual reconnect triggered...');
        websocketService.resetConnectionAttempts();
        websocketService.disconnect();
        setTimeout(() => {
            websocketService.connect();
        }, 500);
    };

    return (
        <NotificationContext.Provider value={{ toasts, removeToast, isConnected, reconnect }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};