import React, { useState, useEffect } from 'react';
import { Settings, User, Edit2, Save, AlertCircle, Loader } from 'lucide-react';
import Layout from './Layout';
import { useTheme } from '../context/ThemeContext';

interface UserProfile {
    id: number;
    email: string;
    username: string;
    fullName: string;
    avatarUrl: string;
}

interface SettingsPageProps {
    onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('general');
    const { theme, setTheme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editedProfile, setEditedProfile] = useState<Partial<UserProfile> | null>(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError('');

            const userData = localStorage.getItem('user');
            if (!userData) {
                setError('User not found. Please login again.');
                return;
            }

            const user = JSON.parse(userData);
            const userId = user.id;

            const response = await fetch(
                `https://work-management-chi.vercel.app/users/${userId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile(data);
            setEditedProfile(data);
        } catch (err) {
            setError('Failed to load profile. Please try again.');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile || !editedProfile) return;

        try {
            setSaving(true);
            setError('');

            const response = await fetch(
                `https://work-management-chi.vercel.app/users/${profile.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fullName: editedProfile.fullName,
                        email: editedProfile.email,
                        avatarUrl: editedProfile.avatarUrl,
                        username: editedProfile.username,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedData = await response.json();
            setProfile(updatedData);
            setEditedProfile(updatedData);
            localStorage.setItem('user', JSON.stringify(updatedData));
            setIsEditing(false);
        } catch (err) {
            setError('Failed to save profile. Please try again.');
            console.error('Error saving profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
    };

    return (
        <Layout onLogout={onLogout}>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Settings</h1>

                {/* Error Message */}
                {error && !loading && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-700 text-sm">{error}</p>
                            <button
                                onClick={fetchUserProfile}
                                className="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-md p-12 flex flex-col items-center justify-center">
                        <Loader size={48} className="text-purple-500 animate-spin mb-4" />
                        <p className="text-gray-600 text-lg">Loading settings...</p>
                    </div>
                )}

                {/* Settings Content */}
                {!loading && profile && (
                    <div className="flex gap-6">
                        {/* Sidebar Navigation */}
                        <div className="w-48">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`w-full text-left px-4 py-3 font-medium transition border-l-4 ${activeTab === 'general'
                                        ? 'bg-purple-50 border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Settings size={18} />
                                        <span>General</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('user')}
                                    className={`w-full text-left px-4 py-3 font-medium transition border-l-4 ${activeTab === 'user'
                                        ? 'bg-purple-50 border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <User size={18} />
                                        <span>User</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                {/* General Tab */}
                                {activeTab === 'general' && (
                                    <div>
                                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">General Settings</h2>

                                        <div className="space-y-6">
                                            {/* Theme Section */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appearance</h3>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                                        Theme
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            onClick={() => handleThemeChange('light')}
                                                            className={`p-4 rounded-lg border-2 transition ${theme === 'light'
                                                                ? 'border-purple-500 bg-purple-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="text-center">
                                                                <div className="w-16 h-12 bg-white border border-gray-300 rounded mb-2 mx-auto"></div>
                                                                <p className="font-medium text-gray-800">Light</p>
                                                            </div>
                                                        </button>

                                                        <button
                                                            onClick={() => handleThemeChange('dark')}
                                                            className={`p-4 rounded-lg border-2 transition ${theme === 'dark'
                                                                ? 'border-purple-500 bg-purple-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="text-center">
                                                                <div className="w-16 h-12 bg-gray-800 border border-gray-700 rounded mb-2 mx-auto"></div>
                                                                <p className="font-medium text-gray-800">Dark</p>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* User Tab */}
                                {activeTab === 'user' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-semibold text-gray-800">User Information</h2>
                                            <button
                                                onClick={() => {
                                                    if (isEditing) {
                                                        handleSave();
                                                    } else {
                                                        setIsEditing(true);
                                                    }
                                                }}
                                                disabled={saving}
                                                className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader size={18} className="animate-spin" />
                                                        <span>Saving...</span>
                                                    </>
                                                ) : isEditing ? (
                                                    <>
                                                        <Save size={18} />
                                                        <span>Save</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit2 size={18} />
                                                        <span>Edit</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Full Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Full Name
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editedProfile?.fullName || ''}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                                                        disabled={saving}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800 px-4 py-2">{profile.fullName}</p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        value={editedProfile?.email || ''}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                                        disabled={saving}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800 px-4 py-2">{profile.email}</p>
                                                )}
                                            </div>

                                            {/* Username */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Username
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editedProfile?.username || ''}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                                                        disabled={saving}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                                    />
                                                ) : (
                                                    <p className="text-gray-800 px-4 py-2">@{profile.username}</p>
                                                )}
                                            </div>

                                            {/* Avatar URL */}
                                            {isEditing && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Avatar URL
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={editedProfile?.avatarUrl || ''}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, avatarUrl: e.target.value })}
                                                        disabled={saving}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                                        placeholder="https://example.com/avatar.jpg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SettingsPage;
