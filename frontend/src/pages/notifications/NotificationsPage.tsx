import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Clock } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { apiCall, getAuthHeaders } from '../../utils/api';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationsPageProps {
    onLogout: () => void;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch notifications on component mount
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const user = localStorage.getItem('user');
            const userId = user ? JSON.parse(user).id : null;

            if (!userId) {
                console.error('User ID not found in localStorage');
                return;
            }

            const response = await apiCall(`https://work-management-chi.vercel.app/notifications/user/${userId}`);
            const data = await response.json();
            const notificationsData: Notification[] = Array.isArray(data) ? data : data.data || [];
            setNotifications(notificationsData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const user = localStorage.getItem('user');
            const userId = user ? JSON.parse(user).id : null;

            if (!userId) {
                return;
            }

            const response = await apiCall(`https://work-management-chi.vercel.app/notifications/user/${userId}/count`);
            const data = await response.json();
            setUnreadCount(data.count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const response = await apiCall(`https://work-management-chi.vercel.app/notifications/${id}/read`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setNotifications(
                    notifications.map((notif) =>
                        notif.id === id ? { ...notif, read: true } : notif
                    )
                );
                // Update unread count
                fetchUnreadCount();
            } else {
                console.error('Error marking notification as read:', response.statusText);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const user = localStorage.getItem('user');
            const userId = user ? JSON.parse(user).id : null;

            if (!userId) {
                return;
            }

            const response = await apiCall(`https://work-management-chi.vercel.app/notifications/user/${userId}/read-all`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                setNotifications(
                    notifications.map((notif) => ({ ...notif, read: true }))
                );
                setUnreadCount(0);
            } else {
                console.error('Error marking all as read:', response.statusText);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const response = await apiCall(`https://work-management-chi.vercel.app/notifications/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                console.error('Error deleting notification:', response.statusText);
                return;
            }

            // Remove from UI after successful deletion
            setNotifications(notifications.filter((notif) => notif.id !== id));
            // Update unread count
            fetchUnreadCount();
            console.log('Notification deleted successfully');
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const deleteAllNotifications = async () => {
        if (!window.confirm('Are you sure you want to delete all notifications?')) {
            return;
        }

        try {
            const user = localStorage.getItem('user');
            const userId = user ? JSON.parse(user).id : null;

            if (!userId) {
                return;
            }

            const response = await apiCall(`https://work-management-chi.vercel.app/notifications/user/${userId}/all`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                console.error('Error deleting all notifications:', response.statusText);
                return;
            }

            // Clear all notifications
            setNotifications([]);
            setUnreadCount(0);
            console.log('All notifications deleted successfully');
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        }
    };

    const getDisplayedUnreadCount = notifications.filter((n) => !n.read).length;

    const getTypeBgColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 border-green-300';
            case 'warning':
                return 'bg-yellow-100 border-yellow-300';
            case 'error':
                return 'bg-red-100 border-red-300';
            default:
                return 'bg-blue-100 border-blue-300';
        }
    };

    const getTypeIconColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-blue-600';
        }
    };

    return (
        
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                    <div className="flex items-center gap-3">
                        {getDisplayedUnreadCount > 0 && (
                            <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                {getDisplayedUnreadCount} Unread
                            </span>
                        )}
                        {getDisplayedUnreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium transition"
                            >
                                Mark All Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={deleteAllNotifications}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition"
                            >
                                Delete All
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-gray-500">Loading notifications...</div>
                    </div>
                )}

                {/* Notifications List */}
                {!loading && (
                    <div className="space-y-3">
                        {notifications.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <Bell size={48} className="mx-auto text-gray-400 mb-3" />
                                <p className="text-gray-600 text-lg">No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`border rounded-lg p-4 transition ${notification.read
                                        ? 'bg-white border-gray-200'
                                        : `${getTypeBgColor(notification.type)}`
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <Bell
                                                size={20}
                                                className={`mt-1 flex-shrink-0 ${getTypeIconColor(notification.type)}`}
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                                                <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
                                                <div className="flex items-center text-gray-500 text-xs mt-2 space-x-1">
                                                    <Clock size={14} />
                                                    <span>{notification.time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded transition"
                                                >
                                                    Mark Read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="text-gray-500 hover:text-red-600 transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

    );
};

export default NotificationsPage;