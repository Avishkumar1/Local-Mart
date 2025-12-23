import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopDashboard from './pages/ShopDashboard';
import AddProduct from './pages/AddProduct';
import ShopDetails from './pages/ShopDetails';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import DeliveryDashboard from './pages/DeliveryDashboard';
import { Role } from './constants';


const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-leaf-600">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen font-sans">
            <Navbar />
            <CartDrawer />
            <div className="flex-grow">
                {children}
            </div>
            <footer className="bg-white border-t border-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} LocalMart. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/search" element={<Layout><SearchResults /></Layout>} />

                        {/* Customer Routes (Public/Hybrid) */}
                        <Route path="/" element={<Layout><Home /></Layout>} />
                        <Route path="/shop/:id" element={<Layout><ShopDetails /></Layout>} />

                        {/* Protected User Routes */}
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Layout><Profile /></Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-orders"
                            element={
                                <ProtectedRoute>
                                    <Layout><MyOrders /></Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/order/:id"
                            element={
                                <ProtectedRoute>
                                    <Layout><OrderTracking /></Layout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Shopkeeper Routes (Protected) */}
                        <Route
                            path="/shop/dashboard"
                            element={
                                <ProtectedRoute requiredRole={Role.SHOPKEEPER}>
                                    <Layout><ShopDashboard /></Layout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/shop/add"
                            element={
                                <ProtectedRoute requiredRole={Role.SHOPKEEPER}>
                                    <Layout><AddProduct /></Layout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Delivery Partner Routes (Protected) */}
                        <Route
                            path="/delivery/dashboard"
                            element={
                                <ProtectedRoute requiredRole={'DeliveryPartner'}>
                                    <Layout><DeliveryDashboard /></Layout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
};

export default App;
