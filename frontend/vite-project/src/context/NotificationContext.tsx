import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiCall } from '../utils/api';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationContextType {
    toasts: Notification[];
    removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Notification[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const previousNotificationsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const user = localStorage.getItem('user');
                const userId = user ? JSON.parse(user).id : null;

                if (!userId) {
                    return;
                }

                const response = await apiCall(`https://work-management-chi.vercel.app/notifications/user/${userId}`);
                const data = await response.json();
                const notificationsData: Notification[] = Array.isArray(data) ? data : data.data || [];

                console.log(' Fetched notifications:', notificationsData.length);

                const currentIds = new Set(notificationsData.map(n => n.id));
                const newNotifications = notificationsData.filter(notif => !previousNotificationsRef.current.has(notif.id));

                console.log(' New notifications:', newNotifications.length);

                if (!isInitialLoad && newNotifications.length > 0) {
                    newNotifications.forEach((notif) => {
                        console.log(' Showing toast for:', notif.title);
                        setToasts((prev) => [...prev, notif]);
                    });
                }

                previousNotificationsRef.current = currentIds;
                setIsInitialLoad(false);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        // // Initial fetch
        // fetchNotifications();

        // // Set up interval
        // const interval = setInterval(() => {
        //     fetchNotifications();
        // }, 60000);

        // return () => clearInterval(interval);
    }, [isInitialLoad]);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ toasts, removeToast }}>
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
