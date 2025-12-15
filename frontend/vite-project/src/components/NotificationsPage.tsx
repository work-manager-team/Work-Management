import React, { useState } from 'react';
import { Bell, Trash2, Clock } from 'lucide-react';
import Layout from './Layout';

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

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onLogout }) => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Task Assigned',
            message: 'You have been assigned to "Redesign Dashboard" task',
            time: '2 hours ago',
            read: false,
            type: 'info'
        },
        {
            id: '2',
            title: 'Task Completed',
            message: 'John completed the "API Integration" task',
            time: '4 hours ago',
            read: false,
            type: 'success'
        },
        {
            id: '3',
            title: 'Comment Added',
            message: 'Sarah commented on your task "User Authentication"',
            time: '1 day ago',
            read: true,
            type: 'info'
        },
        {
            id: '4',
            title: 'Deadline Alert',
            message: '"Database Migration" task is due in 2 hours',
            time: '1 day ago',
            read: true,
            type: 'warning'
        },
        {
            id: '5',
            title: 'Project Update',
            message: 'Project "Mobile App" has been updated with new requirements',
            time: '2 days ago',
            read: true,
            type: 'info'
        }
    ]);

    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter((notif) => notif.id !== id));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

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
        <Layout onLogout={onLogout}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            {unreadCount} Unread
                        </span>
                    )}
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Notification Preferences</h2>
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                            <span className="ml-3 text-gray-700">Task assignments</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                            <span className="ml-3 text-gray-700">Task updates</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                            <span className="ml-3 text-gray-700">Comments on tasks</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                            <span className="ml-3 text-gray-700">Deadline alerts</span>
                        </label>
                    </div>
                </div>

                {/* Notifications List */}
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
            </div>
        </Layout>
    );
};

export default NotificationsPage;
