import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../constants';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        city: '',
        gender: 'Prefer not to say',
        role: 'Customer'
    });
    const [error, setError] = useState('');

    const { register, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData);

            if (formData.role === 'Shopkeeper') navigate('/shop/dashboard');
            else if (formData.role === 'DeliveryPartner') navigate('/delivery/dashboard');
            else navigate('/');
        } catch (err) {
            console.error(err);
            // Extract error message from axios response if available
            const msg = err.response?.data?.message || err.message || 'Failed to register';
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-display font-extrabold text-gray-900">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join LocalMart today
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Simple grid layout for form */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-leaf-500 focus:border-leaf-500 sm:text-sm"
                                    placeholder="John Doe"
                                    onChange={handleChange}
                                    value={formData.name}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-leaf-500 focus:border-leaf-500 sm:text-sm"
                                    placeholder="john@example.com"
                                    onChange={handleChange}
                                    value={formData.email}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-leaf-500 focus:border-leaf-500 sm:text-sm"
                                    placeholder="1234567890"
                                    onChange={handleChange}
                                    value={formData.phone}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-leaf-500 focus:border-leaf-500 sm:text-sm"
                                    placeholder="********"
                                    onChange={handleChange}
                                    value={formData.password}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Address</label>
                                <input
                                    name="address"
                                    type="text"
                                    required
                                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-leaf-500 focus:border-leaf-500 sm:text-sm"
                                    placeholder="123 Main St"
                                    onChange={handleChange}
                                    value={formData.address}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <input
                                    name="city"
                                    type="text"
                                    required
                                    className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-leaf-500 focus:border-leaf-500 sm:text-sm"
                                    placeholder="New York"
                                    onChange={handleChange}
                                    value={formData.city}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-700 block mb-2">I am a:</label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="role"
                                    value="Customer"
                                    checked={formData.role === 'Customer'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="text-leaf-600 focus:ring-leaf-500"
                                />
                                <span className="text-sm text-gray-700">Customer</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="role"
                                    value="Shopkeeper"
                                    checked={formData.role === 'Shopkeeper'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="text-leaf-600 focus:ring-leaf-500"
                                />
                                <span className="text-sm text-gray-700">Shopkeeper</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="role"
                                    value="DeliveryPartner"
                                    checked={formData.role === 'DeliveryPartner'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="text-leaf-600 focus:ring-leaf-500"
                                />
                                <span className="text-sm text-gray-700">Delivery Partner</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-leaf-600 hover:bg-leaf-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-leaf-500 shadow-lg transition-all"
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-leaf-600 hover:text-leaf-500">
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
