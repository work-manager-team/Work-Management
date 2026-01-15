import React, { useState } from 'react';
import { Bell, Trash2, Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { websocketService } from '../../services/user/websocket.service';

interface NotificationsPageProps {
    onLogout: () => void;
}

const NotificationsPage = () => {
    const {
        notifications,
        unreadCount,
        loading,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refresh
    } = useNotifications();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);

    const handleReconnect = () => {
        setReconnecting(true);
        websocketService.disconnect();
        websocketService.resetConnectionAttempts();
        setTimeout(() => {
            websocketService.connect();
            // Check status after a few seconds
            setTimeout(() => {
                setReconnecting(false);
            }, 5000);
        }, 1000);
    };

    const handleMarkAsRead = async (id: number) => {
        await markAsRead(id);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    const handleDeleteNotification = (id: number) => {
        setNotificationToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteNotification = async () => {
        if (notificationToDelete === null) return;
        await deleteNotification(notificationToDelete);
        setShowDeleteConfirm(false);
        setNotificationToDelete(null);
    };

    const handleDeleteAllNotifications = () => {
        setShowDeleteAllConfirm(true);
    };

    const confirmDeleteAllNotifications = async () => {
        await deleteAllNotifications();
        setShowDeleteAllConfirm(false);
    };

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
        <div>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                        {/* WebSocket Connection Status - shows reconnect option when offline */}
                        <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition ${isConnected
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                            onClick={!isConnected && !reconnecting ? handleReconnect : undefined}
                            title={!isConnected ? 'Real-time updates unavailable. Click to retry or use Refresh button.' : 'Real-time updates active'}
                        >
                            {reconnecting ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : isConnected ? (
                                <Wifi size={14} />
                            ) : (
                                <WifiOff size={14} />
                            )}
                            {reconnecting ? 'Connecting...' : isConnected ? 'Live' : 'Manual'}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={refresh}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition text-sm"
                        >
                            Refresh
                        </button>
                        {unreadCount > 0 && (
                            <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                {unreadCount} Unread
                            </span>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium transition"
                            >
                                Mark All Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleDeleteAllNotifications}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition"
                            >
                                Delete All
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-600">Loading notifications...</p>
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
                                    className={`border rounded-lg p-4 transition ${notification.isRead
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
                                                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded transition"
                                                >
                                                    Mark Read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteNotification(notification.id)}
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

            {/* Delete Notification Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Notification?</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this notification? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setNotificationToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteNotification}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete All Notifications Confirmation Modal */}
            {showDeleteAllConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Delete All Notifications?</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete all notifications? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteAllConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteAllNotifications}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;