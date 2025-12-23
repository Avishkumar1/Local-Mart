import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Truck, CheckCircle, MapPin, Package, Phone, Navigation, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [available, setAvailable] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Assigned');
    const navigate = useNavigate();

    const fetchDeliveries = async () => {
        try {
            const data = await api.orders.getDeliveryOrders();
            setDeliveries(data || []);
        } catch (e) {
            console.error("Failed to fetch deliveries", e);
            setDeliveries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
        // Refresh every 4 seconds for real-time updates
        const interval = setInterval(fetchDeliveries, 4000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.orders.updateStatus(id, status);
            setDeliveries(deliveries.map(d => d._id === id ? { ...d, status } : d));
        } catch (e) {
            console.error("Failed to update", e);
        }
    };

    const toggleAvailability = () => {
        setAvailable(!available);
        // TODO: Call API to update availability status
    };

    const assignedOrders = deliveries.filter(d => d.status === 'Assigned');
    const pickedUpOrders = deliveries.filter(d => d.status === 'PickedUp');
    const deliveredOrders = deliveries.filter(d => d.status === 'Delivered');

    const getStatusColor = (status) => {
        const colors = {
            'Assigned': 'bg-indigo-100 text-indigo-800 border-indigo-300',
            'PickedUp': 'bg-purple-100 text-purple-800 border-purple-300',
            'Delivered': 'bg-green-100 text-green-800 border-green-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage your active deliveries</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <div className={`h-3 w-3 rounded-full transition ${available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-700 mr-3">{available ? 'Online' : 'Offline'}</span>
                        <button
                            onClick={toggleAvailability}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                available
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                        >
                            {available ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Assigned</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-2">{assignedOrders.length}</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <Truck className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">In Transit</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">{pickedUpOrders.length}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <Navigation className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Completed</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{deliveredOrders.length}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { status: 'Assigned', label: 'Assigned', count: assignedOrders.length, color: 'indigo' },
                        { status: 'PickedUp', label: 'In Transit', count: pickedUpOrders.length, color: 'purple' },
                        { status: 'Delivered', label: 'Completed', count: deliveredOrders.length, color: 'green' }
                    ].map((tab) => (
                        <button
                            key={tab.status}
                            onClick={() => setFilterStatus(tab.status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filterStatus === tab.status
                                    ? `bg-${tab.color}-600 text-white`
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {tab.label} <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Deliveries List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading deliveries...</p>
                    </div>
                ) : (() => {
                    let displayDeliveries = [];
                    if (filterStatus === 'Assigned') displayDeliveries = assignedOrders;
                    else if (filterStatus === 'PickedUp') displayDeliveries = pickedUpOrders;
                    else if (filterStatus === 'Delivered') displayDeliveries = deliveredOrders;

                    return displayDeliveries.length === 0 ? (
                        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
                            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-2">No {filterStatus.toLowerCase()} deliveries</p>
                            <p className="text-sm text-gray-400">
                                {filterStatus === 'Assigned' ? 'Stay online to receive orders' : 'Check other tabs for deliveries'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayDeliveries.map(delivery => (
                                <div
                                    key={delivery._id}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-1 rounded">#{delivery._id.slice(-6)}</span>
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(delivery.status)}`}>
                                                    {delivery.status === 'PickedUp' ? 'In Transit' : delivery.status}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg">{delivery.userId?.Name || 'Customer'}</h3>
                                        </div>
                                        <div className="text-right w-full md:w-auto">
                                            <p className="text-2xl font-bold text-gray-900">₹{delivery.totalAmount.toFixed(2)}</p>
                                            <p className="text-xs text-gray-500 mt-1">{delivery.items.length} items</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> Pickup
                                            </p>
                                            <p className="font-bold text-gray-900">{delivery.shopId?.Name || 'Shop'}</p>
                                            <p className="text-sm text-gray-600">{delivery.shopId?.Address}</p>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <p className="text-xs text-blue-600 uppercase font-semibold mb-2 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> Dropoff
                                            </p>
                                            <p className="font-bold text-gray-900">{delivery.shippingAddress}</p>
                                        </div>
                                    </div>

                                    {/* Customer Contact */}
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Contact</p>
                                        <a href={`tel:${delivery.userId?.Phone}`} className="flex items-center gap-2 text-leaf-600 hover:text-leaf-700 font-medium">
                                            <Phone className="h-4 w-4" />
                                            {delivery.userId?.Phone}
                                        </a>
                                    </div>

                                    {/* Items */}
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-2 flex items-center gap-2">
                                            <Package className="h-4 w-4" /> Items
                                        </p>
                                        <div className="space-y-1">
                                            {delivery.items.slice(0, 3).map((item, i) => (
                                                <p key={i} className="text-sm text-gray-700">
                                                    {item.quantity}x {item.name} - ₹{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            ))}
                                            {delivery.items.length > 3 && (
                                                <p className="text-xs text-gray-500 mt-2">+ {delivery.items.length - 3} more items</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        {delivery.status === 'Assigned' && (
                                            <button
                                                onClick={() => updateStatus(delivery._id, 'PickedUp')}
                                                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-purple-700 transition"
                                            >
                                                ✓ Confirm Pickup
                                            </button>
                                        )}
                                        {delivery.status === 'PickedUp' && (
                                            <button
                                                onClick={() => updateStatus(delivery._id, 'Delivered')}
                                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-green-700 transition"
                                            >
                                                ✓ Mark Delivered
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/order/${delivery._id}`)}
                                            className="flex-1 md:flex-none bg-blue-50 text-blue-600 py-2 px-4 rounded-lg font-bold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                        >
                                            <Eye className="h-4 w-4" /> View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
