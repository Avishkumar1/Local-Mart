import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash, Package, DollarSign, TrendingUp, AlertCircle, Eye, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ShopDashboard = () => {
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Pending');
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const [itemsData, ordersData] = await Promise.all([
                api.items.getMyShopItems(),
                api.orders.getShopOrders()
            ]);
            setItems(itemsData || []);
            setOrders(ordersData || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Refresh every 4 seconds for real-time updates
        const interval = setInterval(fetchDashboardData, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.items.delete(id);
                setItems(items.filter(i => i.id !== id));
            } catch (error) {
                console.error("Failed to delete item", error);
            }
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.orders.updateStatus(orderId, newStatus);
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Accepted': 'bg-blue-100 text-blue-800 border-blue-300',
            'Assigned': 'bg-indigo-100 text-indigo-800 border-indigo-300',
            'PickedUp': 'bg-purple-100 text-purple-800 border-purple-300',
            'Delivered': 'bg-green-100 text-green-800 border-green-300',
            'Rejected': 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const pendingOrders = orders.filter(o => o.status === 'Pending');
    const acceptedOrders = orders.filter(o => o.status === 'Accepted');
    const activeOrders = orders.filter(o => ['Assigned', 'PickedUp'].includes(o.status));
    const completedOrders = orders.filter(o => ['Delivered', 'Rejected'].includes(o.status));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shop Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your inventory and track orders in real-time</p>
                </div>
                <Link
                    to="/shop/add"
                    className="inline-flex items-center justify-center px-4 py-2 bg-leaf-600 text-white rounded-lg font-medium shadow hover:bg-leaf-700 transition-colors"
                >
                    Add New Product
                </Link>
                <button
                    onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(async (position) => {
                                try {
                                    await api.user.updateLocation(position.coords.latitude, position.coords.longitude);
                                    alert('Shop Location updated successfully! ✅');
                                } catch (e) {
                                    console.error(e);
                                    alert('Failed to update location in database.');
                                }
                            }, (err) => {
                                console.error(err);
                                alert("Unable to retrieve location. Please allow location access.");
                            });
                        } else {
                            alert("Geolocation is not supported by this browser.");
                        }
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-colors ml-2"
                >
                    <MapPin className="h-5 w-5 mr-2" />
                    Update Shop Location
                </button>
            </Link>
        </div>

            {/* Stats Cards */ }
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                    <Package className="h-6 w-6 text-blue-600" />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-red-600">Pending Orders</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">{pendingOrders.length}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Sales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">₹{completedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toFixed(0)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{items.length}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
            </div>
        </div>
    </div>

    {/* Orders Section - Tabbed */ }
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="border-b border-gray-100">
            <div className="flex flex-wrap p-4">
                {[
                    { label: 'Pending', status: 'Pending', color: 'text-red-600', count: pendingOrders.length },
                    { label: 'Accepted', status: 'Accepted', color: 'text-blue-600', count: acceptedOrders.length },
                    { label: 'In Transit', status: 'active', color: 'text-indigo-600', count: activeOrders.length },
                    { label: 'Completed', status: 'completed', color: 'text-green-600', count: completedOrders.length }
                ].map((tab, idx) => (
                    <button
                        key={idx}
                        onClick={() => setFilterStatus(tab.status)}
                        className={`px-6 py-3 font-medium border-b-2 transition ${filterStatus === tab.status
                            ? `border-leaf-600 ${tab.color}`
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <span className={tab.color}>{tab.label}</span>
                        <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-bold">{tab.count}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="overflow-x-auto">
            {loading ? (
                <div className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leaf-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading orders...</p>
                </div>
            ) : (() => {
                let displayOrders = [];
                if (filterStatus === 'Pending') displayOrders = pendingOrders;
                else if (filterStatus === 'Accepted') displayOrders = acceptedOrders;
                else if (filterStatus === 'active') displayOrders = activeOrders;
                else if (filterStatus === 'completed') displayOrders = completedOrders;

                return displayOrders.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                        No {filterStatus.toLowerCase()} orders
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayOrders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs font-bold text-gray-600">#{order._id.slice(-6)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{order.userId?.Name || 'Customer'}</p>
                                            <p className="text-xs text-gray-500">{order.shippingAddress}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">
                                            <p>{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {order.items.slice(0, 2).map(i => i.name).join(', ')}
                                                {order.items.length > 2 && ` + ${order.items.length - 2}`}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs rounded-full font-bold border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Accepted')}
                                                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 font-medium"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Rejected')}
                                                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700 font-medium"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {(order.status === 'Accepted' || order.status === 'Assigned' || order.status === 'PickedUp') && (
                                                <button
                                                    onClick={() => navigate(`/order/${order._id}`)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 flex items-center gap-1 font-medium"
                                                >
                                                    <Eye className="h-3 w-3" /> View
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            })()}
        </div>
    </div>

    {/* Inventory Table */ }
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                    <tr>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3">Price</th>
                        <th className="px-6 py-3">Stock</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading inventory...</td></tr>
                    ) : items.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No items found. Add one!</td></tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover bg-gray-100" />
                                        <span className="font-medium text-gray-900">{item.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">${item.price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.quantity > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {item.quantity} in stock
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.category}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
        </div >
    );
};

export default ShopDashboard;
