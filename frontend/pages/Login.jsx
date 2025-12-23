import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../constants';
import { Store, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

const Login = () => {
    const [role, setRole] = useState(Role.CUSTOMER);
    const [email, setEmail] = useState('user@test.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    const { login, signInWithGoogle, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password, role);
            if (role === Role.SHOPKEEPER) navigate('/shop/dashboard');
            else if (role === 'DeliveryPartner') navigate('/delivery/dashboard');
            else navigate('/');
        } catch (err) {
            setError('Failed to login. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-leaf-50 to-white px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50">

                {/* Header / Tabs */}
                <div className="flex text-center border-b border-gray-100">
                    <button
                        onClick={() => setRole(Role.CUSTOMER)}
                        className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-all ${role === Role.CUSTOMER
                            ? 'bg-white text-leaf-600 border-b-2 border-leaf-600'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <ShoppingBag className="h-4 w-4" /> Customer
                    </button>
                    <button
                        onClick={() => setRole(Role.SHOPKEEPER)}
                        className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-all ${role === Role.SHOPKEEPER
                            ? 'bg-white text-leaf-600 border-b-2 border-leaf-600'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <Store className="h-4 w-4" /> Shopkeeper
                    </button>
                    <button
                        onClick={() => setRole('DeliveryPartner')}
                        className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-all ${role === 'DeliveryPartner'
                            ? 'bg-white text-leaf-600 border-b-2 border-leaf-600'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <Truck className="h-4 w-4" /> Partner
                    </button>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-display font-bold text-gray-900">
                            Welcome Back
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Sign in to manage your {role === Role.CUSTOMER ? 'orders' : 'shop'}.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-leaf-600 text-white font-semibold py-3 rounded-xl hover:bg-leaf-700 shadow-lg shadow-leaf-200 transition-all flex items-center justify-center"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                    </form>

                    {role === Role.CUSTOMER && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={signInWithGoogle}
                                type="button"
                                className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center"
                            >
                                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12.61C5,8.76 8.32,5.71 12.15,5.71C14.06,5.71 15.62,6.49 16.67,7.56L18.42,5.82C16.8,4.34 14.65,3.32 12.15,3.32C6.9,3.32 2.67,7.49 2.67,12.63C2.67,17.77 6.9,21.94 12.15,21.94C17.43,21.94 21.05,18.15 21.05,12.87C21.05,12.26 21.01,11.69 20.89,11.1L21.35,11.1L21.35,11.1Z"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        </>
                    )}

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-leaf-600 hover:text-leaf-500">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
