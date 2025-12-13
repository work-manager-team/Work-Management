import React, { useState } from 'react';
import { Settings, Lock, Bell, Users, Palette, Save } from 'lucide-react';
import Layout from './Layout';

interface SettingsPageProps {
    onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        fullName: 'John Doe',
        email: 'john@example.com',
        language: 'en',
        theme: 'light',
        notifications: true,
        emailNotifications: true,
        twoFactor: false,
        privacy: 'public'
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <Layout onLogout={onLogout}>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Settings</h1>

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
                                onClick={() => setActiveTab('notification')}
                                className={`w-full text-left px-4 py-3 font-medium transition border-l-4 ${activeTab === 'notification'
                                        ? 'bg-purple-50 border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Bell size={18} />
                                    <span>Notifications</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('privacy')}
                                className={`w-full text-left px-4 py-3 font-medium transition border-l-4 ${activeTab === 'privacy'
                                        ? 'bg-purple-50 border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Lock size={18} />
                                    <span>Privacy & Security</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('appearance')}
                                className={`w-full text-left px-4 py-3 font-medium transition border-l-4 ${activeTab === 'appearance'
                                        ? 'bg-purple-50 border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Palette size={18} />
                                    <span>Appearance</span>
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

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.fullName}
                                                onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.email}
                                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Language
                                            </label>
                                            <select
                                                value={settings.language}
                                                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="en">English</option>
                                                <option value="vi">Tiếng Việt</option>
                                                <option value="es">Español</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notification Tab */}
                            {activeTab === 'notification' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Notification Settings</h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">In-App Notifications</p>
                                                <p className="text-sm text-gray-600">Receive notifications within the app</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications}
                                                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">Email Notifications</p>
                                                <p className="text-sm text-gray-600">Receive email notifications about updates</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy & Security Tab */}
                            {activeTab === 'privacy' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Privacy & Security</h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                                                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.twoFactor}
                                                onChange={(e) => setSettings({ ...settings, twoFactor: e.target.checked })}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Profile Privacy
                                            </label>
                                            <select
                                                value={settings.privacy}
                                                onChange={(e) => setSettings({ ...settings, privacy: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="public">Public</option>
                                                <option value="friends">Friends Only</option>
                                                <option value="private">Private</option>
                                            </select>
                                        </div>

                                        <button className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition">
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">Appearance</h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-4">
                                            Theme
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <button
                                                onClick={() => setSettings({ ...settings, theme: 'light' })}
                                                className={`p-4 rounded-lg border-2 transition ${settings.theme === 'light'
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
                                                onClick={() => setSettings({ ...settings, theme: 'dark' })}
                                                className={`p-4 rounded-lg border-2 transition ${settings.theme === 'dark'
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="w-16 h-12 bg-gray-800 border border-gray-700 rounded mb-2 mx-auto"></div>
                                                    <p className="font-medium text-gray-800">Dark</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setSettings({ ...settings, theme: 'auto' })}
                                                className={`p-4 rounded-lg border-2 transition ${settings.theme === 'auto'
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="text-center">
                                                    <div className="w-16 h-12 bg-gradient-to-r from-white to-gray-800 border border-gray-300 rounded mb-2 mx-auto"></div>
                                                    <p className="font-medium text-gray-800">Auto</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="mt-8 flex items-center justify-between">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition"
                                >
                                    <Save size={18} />
                                    <span>Save Changes</span>
                                </button>
                                {saved && <p className="text-green-600 font-medium">✓ Changes saved successfully!</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SettingsPage;
