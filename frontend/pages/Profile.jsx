import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, MapPin, Calendar, LogOut } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-leaf-600 h-32 md:h-48 relative">
                        <div className="absolute -bottom-12 left-8 md:left-12">
                            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl text-gray-400 font-bold">{user.name.charAt(0)}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8 md:px-12">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-leaf-600 font-medium">{user.role}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <span>{user.phone || 'Not provided'}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <span>{user.address || 'Not provided'}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span>Joined recently</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
