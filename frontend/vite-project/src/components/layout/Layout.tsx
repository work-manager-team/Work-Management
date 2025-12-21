import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Plus, MoreHorizontal, Calendar, Bell, Folder, Settings, Table, User, LogOut } from 'lucide-react';
import { ChevronDown } from 'lucide-react'

interface LayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);

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
                                className="flex items-center bg-white hover:bg-gray-100 text-gray-800 px-3 py-1.5 rounded font-medium transition"
                            >
                                <div className="flex flex-col items-center bg-purple-500 text-white hover:bg-purple-600 p-2 rounded">
                                    <User size={20} />
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
            </div>
        </div>
    );
};

export default Layout;