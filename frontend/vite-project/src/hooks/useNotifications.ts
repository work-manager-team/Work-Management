import { useEffect, useState, useCallback, useRef } from 'react';
import { notificationService } from '../services/notification.service';
import type { Notification } from '../services/notification.service';
import { websocketService, NotificationData } from '../services/websocket.service';
import { authService } from '../services/auth.service';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    // Use ref to track initialization and prevent multiple API calls
    const isInitialized = useRef(false);
    const userId = authService.getCurrentUser()?.id;

    const loadNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const [allNotifications, count] = await Promise.all([
                notificationService.getUserNotifications(userId),
                notificationService.getUnreadCount(userId),
            ]);
            setNotifications(allNotifications);
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        // Prevent multiple initializations
        if (!userId || isInitialized.current) return;
        isInitialized.current = true;

        // Load initial notifications
        loadNotifications();

        // Try to connect WebSocket (non-blocking, will fail gracefully if server unavailable)
        websocketService.connect().catch(err => {
            console.warn('⚠️ WebSocket connection failed, using manual refresh mode');
        });

        const unsubscribe = websocketService.onNotification((notification: NotificationData) => {
            console.log('📥 Received notification in hook:', notification);

            // Add new notification to top of list
            const newNotification: Notification = {
                id: notification.id || Date.now(),
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                relatedEntityType: notification.relatedEntityType,
                relatedEntityId: notification.relatedEntityId,
                isRead: false,
                createdAt: notification.createdAt || new Date().toISOString(),
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show browser notification if permission granted
            showBrowserNotification(notification.title, notification.message);
        });

        // Check connection status periodically
        const interval = setInterval(() => {
            setIsConnected(websocketService.isConnected());
        }, 2000);

        // Initial connection status check after short delay
        const initialCheck = setTimeout(() => {
            setIsConnected(websocketService.isConnected());
        }, 1000);

        // Cleanup
        return () => {
            unsubscribe();
            clearInterval(interval);
            clearTimeout(initialCheck);
            websocketService.disconnect();
            isInitialized.current = false;
        };
    }, [userId, loadNotifications]);

    const showBrowserNotification = (title: string, message: string) => {
        // Check if browser supports notifications
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(title, { body: message });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body: message });
                }
            });
        }
    };

    const markAsRead = useCallback(async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;

        try {
            await notificationService.markAllAsRead(userId);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, [userId]);

    const deleteNotification = useCallback(async (id: number) => {
        try {
            const wasUnread = notifications.find(n => n.id === id)?.isRead === false;
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    }, [notifications]);

    const deleteAllNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            await notificationService.deleteAllNotifications(userId);
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to delete all notifications:', error);
        }
    }, [userId]);

    return {
        notifications,
        unreadCount,
        loading,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refresh: loadNotifications,
    };
};
