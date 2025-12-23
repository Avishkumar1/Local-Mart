import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const data = await api.orders.getUserOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Refresh orders every 5 seconds
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Assigned': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
            case 'PickedUp': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Delivered': return 'bg-green-100 text-green-800 border-green-300';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="h-4 w-4" />;
            case 'Accepted': return <CheckCircle className="h-4 w-4" />;
            case 'Assigned': return <Truck className="h-4 w-4" />;
            case 'PickedUp': return <Truck className="h-4 w-4" />;
            case 'Delivered': return <CheckCircle className="h-4 w-4" />;
            case 'Rejected': return <AlertCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(o => o.status === filterStatus);

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-500">Track and manage all your orders</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-full font-medium transition ${
                            filterStatus === 'all'
                                ? 'bg-leaf-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-leaf-600'
                        }`}
                    >
                        All ({orders.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('Pending')}
                        className={`px-4 py-2 rounded-full font-medium transition ${
                            filterStatus === 'Pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-yellow-600'
                        }`}
                    >
                        Pending ({orders.filter(o => o.status === 'Pending').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('Delivered')}
                        className={`px-4 py-2 rounded-full font-medium transition ${
                            filterStatus === 'Delivered'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-600'
                        }`}
                    >
                        Delivered ({orders.filter(o => o.status === 'Delivered').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('Rejected')}
                        className={`px-4 py-2 rounded-full font-medium transition ${
                            filterStatus === 'Rejected'
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-red-600'
                        }`}
                    >
                        Rejected ({orders.filter(o => o.status === 'Rejected').length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your orders...</p>
                        </div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        {filterStatus === 'all' ? (
                            <>
                                <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                                <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-leaf-600 text-white px-6 py-2 rounded-lg hover:bg-leaf-700 transition font-medium"
                                >
                                    Start Shopping
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-500 mb-4">No {filterStatus.toLowerCase()} orders</p>
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className="text-leaf-600 hover:text-leaf-700 font-medium"
                                >
                                    View all orders
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div 
                                key={order._id} 
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer"
                                onClick={() => navigate(`/order/${order._id}`)}
                            >
                                <div className="p-4 md:p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        {/* Order Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500">Order #{order._id.slice(-6).toUpperCase()}</p>
                                                    <p className="text-gray-900 font-semibold mt-1">
                                                        {order.shopId?.Name || 'Shop'}
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </div>
                                            </div>

                                            {/* Items Preview */}
                                            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {order.items.slice(0, 3).map((item, index) => (
                                                    <div key={index} className="text-xs text-gray-600 truncate">
                                                        {item.quantity}x {item.name}
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="text-xs text-gray-500">+{order.items.length - 3} more</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price & Date */}
                                        <div className="w-full md:w-auto text-right">
                                            <p className="text-2xl font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/order/${order._id}`);
                                                }}
                                                className="mt-2 w-full md:w-auto bg-leaf-50 text-leaf-600 px-4 py-2 rounded-lg font-medium hover:bg-leaf-100 transition"
                                            >
                                                Track
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
