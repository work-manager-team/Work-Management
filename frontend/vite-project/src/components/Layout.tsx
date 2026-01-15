import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Plus, MoreHorizontal, Calendar, Bell, Folder, Settings, Table, User, LogOut } from 'lucide-react';
import { ChevronDown } from 'lucide-react'
import Toast from './Toast';
import { useNotification } from '../context/NotificationContext';
import { websocketService } from '../services/websocket.service';

interface LayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [isReconnecting, setIsReconnecting] = useState(false);
    const { toasts, removeToast, isConnected, reconnect } = useNotification();

    useEffect(() => {
        fetchAvatarUrl();
    }, []);

    const fetchAvatarUrl = async () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const response = await fetch(
                        `https://work-management-chi.vercel.app/users/${user.id}/avatar`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    if (response.ok) {
                        const data = await response.json();
                        if (data.avatar?.url) {
                            setAvatarUrl(data.avatar.url);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching avatar:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-21 bg-purple-500 flex flex-col items-center py-4 space-y-6">
                <Link to="/dashboard" className="text-white font-bold text-xl hover:opacity-80">Jira</Link>

                <div className="flex flex-col space-y-4 mt-8">


                    <Link to="/dashboard" className="flex flex-col items-center text-white hover:bg-purple-600 p-2 rounded">
                        <Table size={20} />
                        <span className="text-xs mt-1">Dashboard</span>
                    </Link>

                    <button className="flex flex-col items-center text-white hover:bg-purple-600 p-2 rounded">
                        <Folder size={20} />
                        <span className="text-xs mt-1">Projects</span>
                    </button>

                    <button className="flex flex-col items-center text-white hover:bg-purple-600 p-2 rounded">
                        <Users size={20} />
                        <span className="text-xs mt-1">Members</span>
                    </button>

                    <Link to="/boards" className="flex flex-col items-center text-white hover:bg-purple-600 p-2 rounded">
                        <Table size={20} />
                        <span className="text-xs mt-1">Boards</span>
                    </Link>

                    <Link to="/calendar" className="flex flex-col items-center text-white hover:bg-purple-600 p-2 rounded">
                        <Calendar size={20} />
                        <span className="text-xs mt-1">Calendar</span>
                    </Link>

                    <Link to="/reports" className="flex flex-col items-center text-white hover:bg-purple-600 p-2 rounded">
                        <Bell size={20} />
                        <span className="text-xs mt-1">Reports</span>
                    </Link>

                    <Link to="/notifications" className="flex flex-col items-center text-white hover:bg-purple-600 p-2 rounded">
                        <Bell size={20} />
                        <span className="text-xs mt-1">Notifications</span>
                    </Link>

                    <Link to="/settings" className="flex flex-col items-center text-white hover:bg-purple-600 p-2 rounded">
                        <Settings size={20} />
                        <span className="text-xs mt-1">Settings</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-purple-400 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-800 hover:bg-purple-500 px-3 py-1 rounded flex items-center gap-1">
                            <span>Workspace</span>
                            <ChevronDown size={16} className="text-gray-800" />
                        </button>
                        <button className="text-gray-800 hover:bg-purple-500 px-3 py-1 rounded flex items-center gap-1">
                            <span>Recent</span>
                            <ChevronDown size={16} className="text-gray-800" />
                        </button>
                        <button className="text-gray-800 hover:bg-purple-500 px-3 py-1 rounded flex items-center gap-1">
                            <span>Starred</span>
                            <ChevronDown size={16} className="text-gray-800" />
                        </button>
                        <button className="text-gray-800 hover:bg-purple-500 px-3 py-1 rounded flex items-center gap-1">
                            <span>Templates</span>
                            <ChevronDown size={16} className="text-gray-800" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-purple-300 text-black-800 placeholder-grey-800 px-4 py-1.5 rounded focus:outline-none focus:bg-purple-200"
                        />
                        <button className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-1.5 rounded font-medium">
                            Create
                        </button>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded font-medium flex items-center space-x-1">
                            <span>⚡</span>
                            <span>Try Premium</span>
                        </button>

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 rounded font-medium transition w-10 h-10"
                            >
                                <div className="flex items-center justify-center bg-purple-500 text-white w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                            </button>


                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-t-lg border-b"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <User size={18} />
                                            <span>View Profile</span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            onLogout();
                                        }}
                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <LogOut size={18} />
                                            <span>Log out</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div id="app-content" className="flex-1 overflow-auto p-6">
                    {children}
                </div>

                {/* Toast Notifications */}
                <div className="fixed top-4 right-4 flex flex-col gap-3 z-50 max-w-md">
                    {toasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            id={toast.id}
                            title={toast.title}
                            message={toast.message}
                            type={toast.type}
                            onClose={removeToast}
                            duration={5000}
                        />
                    ))}
                </div>

                {/* Connection Status Indicator */}
                {!isConnected && (
                    <button
                        onClick={() => {
                            if (!isReconnecting) {
                                setIsReconnecting(true);
                                reconnect();
                                setTimeout(() => setIsReconnecting(false), 3000);
                            }
                        }}
                        disabled={isReconnecting}
                        className={`fixed bottom-4 right-4 text-white px-4 py-2 rounded-lg text-sm shadow-lg cursor-pointer hover:opacity-90 transition-all ${isReconnecting ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                    >
                        {isReconnecting ? '🔄 Đang kết nối lại...' : '⚠️ Offline - Click để kết nối lại'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Layout;
