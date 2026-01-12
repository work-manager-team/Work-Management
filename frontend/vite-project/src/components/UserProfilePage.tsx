import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save, AlertCircle, Loader, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { apiCall, getAuthHeaders } from '../utils/api';

interface UserProfile {
    id: number;
    email: string;
    username: string;
    fullName: string;
    avatarUrl: string;
    status: string;
    lastLoginAt: string;
    createdAt: string;
    updatedAt: string;
}

interface UserProfilePageProps {
    onLogout: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editedProfile, setEditedProfile] = useState<Partial<UserProfile> | null>(null);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showNotification, setShowNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError('');

            // Get userId from localStorage
            const userData = localStorage.getItem('user');
            if (!userData) {
                setError('User not found. Please login again.');
                return;
            }

            const user = JSON.parse(userData);
            const userId = user.id;

            const response = await apiCall(
                `https://work-management-chi.vercel.app/users/${userId}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders(),
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

            const response = await apiCall(
                `https://work-management-chi.vercel.app/users/${profile.id}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
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

            // 🔥 cập nhật localStorage
            localStorage.setItem('user', JSON.stringify(updatedData));

            setIsEditing(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
            setError(errorMessage);
            setShowNotification({ type: 'error', message: errorMessage });
            console.error('Error saving profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordError('');

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError('Please fill in all password fields');
            setShowNotification({ type: 'error', message: 'Please fill in all password fields' });
            return;
        }

        if (typeof oldPassword !== 'string') {
            setPasswordError('oldPassword must be a string');
            setShowNotification({ type: 'error', message: 'oldPassword must be a string' });
            return;
        }

        if (oldPassword.length < 6) {
            setPasswordError('Mật khẩu cũ phải có ít nhất 6 ký tự');
            setShowNotification({ type: 'error', message: 'Mật khẩu cũ phải có ít nhất 6 ký tự' });
            return;
        }

        if (typeof newPassword !== 'string') {
            setPasswordError('newPassword must be a string');
            setShowNotification({ type: 'error', message: 'newPassword must be a string' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
            setShowNotification({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            setShowNotification({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        try {
            setPasswordLoading(true);

            const userData = localStorage.getItem('user');
            if (!userData) {
                setPasswordError('User not found. Please login again.');
                setShowNotification({ type: 'error', message: 'User not found. Please login again.' });
                return;
            }

            const user = JSON.parse(userData);
            const userId = user.id;

            const response = await apiCall(
                `https://work-management-chi.vercel.app/users/${userId}/change-password`,
                {
                    method: 'PATCH',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        oldPassword: oldPassword,
                        newPassword: newPassword
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }

            setShowNotification({ type: 'success', message: 'Password changed successfully!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowChangePassword(false);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to change password. Please try again.';
            setPasswordError(errorMessage);
            setShowNotification({ type: 'error', message: errorMessage });
            console.error('Error changing password:', err);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setDeleteLoading(true);

            const userData = localStorage.getItem('user');
            if (!userData) {
                setShowNotification({ type: 'error', message: 'User not found. Please login again.' });
                return;
            }

            const user = JSON.parse(userData);
            const userId = user.id;

            const response = await apiCall(
                `https://work-management-chi.vercel.app/users/${userId}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete account');
            }

            // Clear localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');

            setShowNotification({ type: 'success', message: 'Account deleted successfully!' });

            // Call logout and navigate to login after showing notification
            setTimeout(() => {
                onLogout();
                navigate('/login');
            }, 2000);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete account. Please try again.';
            setShowNotification({ type: 'error', message: errorMessage });
            console.error('Error deleting account:', err);
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <Layout onLogout={onLogout}>
            <div className="max-w-4xl mx-auto">
                {/* Toast Notification */}
                {showNotification && (
                    <div
                        className={`fixed top-4 right-4 rounded-lg shadow-lg p-4 flex items-start gap-3 z-50 animate-fade-in max-w-sm ${showNotification.type === 'success'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                            }`}
                    >
                        {showNotification.type === 'success' ? (
                            <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p
                            className={`text-sm ${showNotification.type === 'success' ? 'text-green-700' : 'text-red-700'
                                }`}
                        >
                            {showNotification.message}
                        </p>
                    </div>
                )}

                <h1 className="text-3xl font-bold mb-6 text-gray-800">Profile</h1>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center justify-center">
                        <Loader size={48} className="text-purple-500 animate-spin mb-4" />
                        <p className="text-gray-600 text-lg">Loading profile...</p>
                    </div>
                )}

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

                {/* Profile Card */}
                {profile && !loading && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Header Background */}
                        <div className="h-32 bg-gradient-to-r from-purple-400 to-purple-600"></div>

                        {/* Profile Content */}
                        <div className="px-6 pb-6">
                            {/* Avatar and Basic Info */}
                            <div className="flex items-end space-x-6 mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold border-4 border-white -mt-12 shadow-lg overflow-hidden">
                                    {editedProfile?.avatarUrl ? (
                                        <img src={editedProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        editedProfile?.fullName?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>

                                <div className="flex-1">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editedProfile?.fullName || ''}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                                                placeholder="Full Name"
                                                disabled={saving}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">
                                                {profile.fullName}
                                            </h2>
                                            <p className="text-gray-600 text-sm">@{profile.username}</p>
                                        </div>
                                    )}
                                </div>

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

                            {/* Profile Info Grid */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                {/* Contact Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Mail size={20} className="text-purple-500 flex-shrink-0" />
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={editedProfile?.email || ''}
                                                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                                    disabled={saving}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                                />
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-gray-600">Email</p>
                                                    <p className="text-gray-800 font-medium">{profile.email}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <User size={20} className="text-purple-500 flex-shrink-0" />
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editedProfile?.username || ''}
                                                    onChange={(e) =>
                                                        setEditedProfile({ ...editedProfile, username: e.target.value })
                                                    }
                                                    disabled={saving}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                                    placeholder="Username"
                                                />
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-gray-600">Username</p>
                                                    <p className="text-gray-800 font-medium">{profile.username}</p>
                                                </div>
                                            )}
                                        </div>


                                        {/* <div className="flex items-center space-x-3">
                                            <Shield size={20} className="text-purple-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm text-gray-600">Status</p>
                                                <p className="text-gray-800 font-medium capitalize">{profile.status}</p>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <Calendar size={20} className="text-purple-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">Member Since</p>
                                                <p className="text-gray-800 font-medium">
                                                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* <div className="flex items-start space-x-3">
                                            <Calendar size={20} className="text-purple-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">Last Login</p>
                                                <p className="text-gray-800 font-medium">
                                                    {new Date(profile.lastLoginAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div> */}

                                        {/* <div className="flex items-start space-x-3">
                                            <User size={20} className="text-purple-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-600">User ID</p>
                                                <p className="text-gray-800 font-medium">#{profile.id}</p>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                            {/* Avatar URL Section */}
                            {isEditing && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                                    <input
                                        type="url"
                                        value={editedProfile?.avatarUrl || ''}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, avatarUrl: e.target.value })}
                                        disabled={saving}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>
                            )}

                            {/* Account Actions */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowChangePassword(true)}
                                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                                    >
                                        <p className="font-medium text-gray-800">Change Password</p>
                                        <p className="text-sm text-gray-600">Update your password</p>
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition"
                                    >
                                        <p className="font-medium text-red-600">Delete Account</p>
                                        <p className="text-sm text-red-600">Permanently delete your account</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h2>

                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{passwordError}</p>
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            {/* Old Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    disabled={passwordLoading}
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                />
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={passwordLoading}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={passwordLoading}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowChangePassword(false);
                                    setPasswordError('');
                                    setOldPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                                disabled={passwordLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={passwordLoading}
                                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {passwordLoading ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Changing...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Trash2 size={24} className="text-red-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Delete Account</h2>
                        </div>

                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.
                        </p>

                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                                <strong>Warning:</strong> This will delete your account and all associated data.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Delete Account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UserProfilePage;
