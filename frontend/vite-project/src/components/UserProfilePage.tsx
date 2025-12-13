import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save } from 'lucide-react';
import Layout from './Layout';

interface UserProfilePageProps {
    onLogout: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ onLogout }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        joinDate: 'January 2024',
        bio: 'Product Designer & Developer | Tech Enthusiast',
        avatar: 'JD'
    });

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <Layout onLogout={onLogout}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Profile</h1>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header Background */}
                    <div className="h-32 bg-gradient-to-r from-purple-400 to-purple-600"></div>

                    {/* Profile Content */}
                    <div className="px-6 pb-6">
                        {/* Avatar and Basic Info */}
                        <div className="flex items-end space-x-6 mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold border-4 border-white -mt-12 shadow-lg">
                                {profile.avatar}
                            </div>

                            <div className="flex-1">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={profile.firstName}
                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                placeholder="First Name"
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <input
                                                type="text"
                                                value={profile.lastName}
                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                placeholder="Last Name"
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {profile.firstName} {profile.lastName}
                                        </h2>
                                        <p className="text-purple-600 font-medium">{profile.bio}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                                className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition"
                            >
                                {isEditing ? (
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
                                        <Mail size={20} className="text-purple-500" />
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        ) : (
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="text-gray-800 font-medium">{profile.email}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Phone size={20} className="text-purple-500" />
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        ) : (
                                            <div>
                                                <p className="text-sm text-gray-600">Phone</p>
                                                <p className="text-gray-800 font-medium">{profile.phone}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <MapPin size={20} className="text-purple-500" />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profile.location}
                                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        ) : (
                                            <div>
                                                <p className="text-sm text-gray-600">Location</p>
                                                <p className="text-gray-800 font-medium">{profile.location}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Calendar size={20} className="text-purple-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Member Since</p>
                                            <p className="text-gray-800 font-medium">{profile.joinDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Shield size={20} className="text-purple-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Account Status</p>
                                            <p className="text-gray-800 font-medium">Active</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <User size={20} className="text-purple-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Role</p>
                                            <p className="text-gray-800 font-medium">Product Designer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio Section */}
                        {isEditing && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    rows={3}
                                />
                            </div>
                        )}

                        {/* Account Actions */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition">
                                    <p className="font-medium text-gray-800">Change Password</p>
                                    <p className="text-sm text-gray-600">Update your password</p>
                                </button>

                                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition">
                                    <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-600">Secure your account</p>
                                </button>

                                <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition">
                                    <p className="font-medium text-red-600">Delete Account</p>
                                    <p className="text-sm text-red-600">Permanently delete your account</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UserProfilePage;
