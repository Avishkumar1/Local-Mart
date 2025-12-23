import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Clock, MapPin, Phone, Truck, CheckCircle, AlertCircle } from 'lucide-react';

const OrderTracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const navigate = useNavigate();

    // Poll for updates every 3 seconds for real-time tracking
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await api.orders.getById(id);
                setOrder(data);
                setLoading(false);
                setError(null);
                setLastUpdate(new Date());
            } catch (error) {
                console.error("Failed to fetch order", error);
                setError("Failed to load order details");
                setLoading(false);
            }
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 3000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your order...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <button onClick={() => navigate('/my-orders')} className="mb-4 text-leaf-600 hover:text-leaf-800 flex items-center gap-2">
                        <span>←</span> Back to Orders
                    </button>
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Order not found'}</h2>
                        <button onClick={() => navigate('/my-orders')} className="bg-leaf-600 text-white px-6 py-2 rounded-lg mt-4">
                            Go to My Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const steps = ['Pending', 'Accepted', 'Assigned', 'PickedUp', 'Delivered'];
    const currentStepIndex = order.status === 'Rejected' ? -1 : steps.indexOf(order.status);
    const isRejected = order.status === 'Rejected';
    const isDelivered = order.status === 'Delivered';

    const getStepIcon = (step) => {
        const iconClass = "h-5 w-5";
        switch(step) {
            case 'Pending': return <Clock className={iconClass} />;
            case 'Accepted': return <CheckCircle className={iconClass} />;
            case 'Assigned': return <Truck className={iconClass} />;
            case 'PickedUp': return <Truck className={iconClass} />;
            case 'Delivered': return <CheckCircle className={iconClass} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/my-orders')} className="mb-6 text-leaf-600 hover:text-leaf-800 flex items-center gap-2 font-medium">
                    <span>←</span> Back to Orders
                </button>

                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
                            <p className="text-gray-500 mt-1">Order #{order._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                                ${isRejected ? 'bg-red-100 text-red-800' :
                                    isDelivered ? 'bg-green-100 text-green-800' :
                                    order.status === 'Accepted' || order.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'}`}>
                                {getStepIcon(order.status)}
                                {order.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-2">Updated: {lastUpdate.toLocaleTimeString()}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-10">
                        {isRejected ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center font-medium">
                                <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-500" />
                                <p>This order has been rejected by the shopkeeper.</p>
                                <p className="text-sm text-red-600 mt-2">Please contact the shop for more information.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start relative">
                                    {steps.map((step, index) => (
                                        <div key={step} className="flex flex-col items-center flex-1 relative">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-3 transition-all duration-300 z-10 bg-white
                                                ${index <= currentStepIndex ? 'bg-leaf-600 border-leaf-600 text-white shadow-md' : 'border-gray-300 text-gray-400'}`}>
                                                {index <= currentStepIndex ? '✓' : index + 1}
                                            </div>
                                            <span className={`text-xs mt-3 font-medium text-center px-2 transition-colors
                                                ${index <= currentStepIndex ? 'text-leaf-600' : 'text-gray-400'}`}>
                                                {step === 'PickedUp' ? 'Picked Up' : step}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 -z-0">
                                        <div
                                            className="h-full bg-leaf-600 transition-all duration-500"
                                            style={{ width: `${currentStepIndex >= 0 ? ((currentStepIndex / (steps.length - 1)) * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Status Message */}
                                {isDelivered && (
                                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                        <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                        <p className="text-green-800 font-medium">Order Delivered Successfully!</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column - Delivery & Shop Info */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-leaf-600" /> Shop & Delivery Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">From Shop</p>
                                        <p className="font-bold text-gray-900">{order.shopId?.Name || 'Shop'}</p>
                                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                            <MapPin className="h-4 w-4" /> {order.shopId?.Address}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Delivery To</p>
                                        <p className="text-sm font-medium text-gray-900">{order.shippingAddress}</p>
                                    </div>

                                    {order.deliveryPartnerId && (order.status === 'Assigned' || order.status === 'PickedUp' || order.status === 'Delivered') && (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                            <p className="text-xs text-blue-600 uppercase font-semibold mb-2 flex items-center gap-1">
                                                <Truck className="h-4 w-4" /> Delivery Partner
                                            </p>
                                            <p className="font-bold text-gray-900">{order.deliveryPartnerId.Name || 'Driver'}</p>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                                <Phone className="h-4 w-4" />
                                                <a href={`tel:${order.deliveryPartnerId.Phone}`} className="text-leaf-600 hover:underline font-medium">
                                                    {order.deliveryPartnerId.Phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="space-y-3 mb-4">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name || 'Product'}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg text-gray-900">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Order Date */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Order Date</p>
                                <p className="text-sm text-gray-900 mt-1">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={() => navigate('/my-orders')}
                            className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                            View All Orders
                        </button>
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex-1 bg-leaf-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-leaf-700 transition"
                        >
                            Refresh Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
