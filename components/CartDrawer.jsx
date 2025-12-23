import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { X, Plus, Minus, Trash2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [orderCreated, setOrderCreated] = useState(null);
    const navigate = useNavigate();

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            // Create order directly
            const response = await api.orders.create({
                items: items,
                totalAmount: totalPrice,
            });

            // Show success and store order
            setOrderCreated(response);
            clearCart();
        } catch (error) {
            console.error("Checkout failed:", error);
            if (error.response?.status === 401) {
                alert('Please login to checkout');
                setIsOpen(false);
                navigate('/login');
            } else {
                alert('Failed to place order. Please try again.');
            }
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (!isOpen) return null;

    // Success screen after checkout
    if (orderCreated) {
        return (
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
                <div className="fixed inset-y-0 right-0 max-w-full flex">
                    <div className="w-screen max-w-md pointer-events-auto">
                        <div className="h-full flex flex-col bg-white shadow-xl">
                            <div className="flex items-center justify-between px-4 py-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Order Placed!</h2>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-6">
                                <div className="p-4 bg-green-100 rounded-full">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
                                    <p className="text-gray-600 mb-4">
                                        Order #{orderCreated._id?.slice(-6).toUpperCase()} has been sent to the shopkeeper.
                                    </p>
                                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                                        <p className="text-sm text-gray-600 mb-2">Order Total</p>
                                        <p className="text-2xl font-bold text-gray-900">₹{orderCreated.totalAmount?.toFixed(2) || totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 w-full">
                                    <button
                                        onClick={() => {
                                            navigate(`/order/${orderCreated._id}`);
                                            setIsOpen(false);
                                        }}
                                        className="w-full bg-leaf-600 text-white py-3 rounded-lg font-bold hover:bg-leaf-700 transition"
                                    >
                                        Track Your Order
                                    </button>
                                    <button
                                        onClick={() => {
                                            setOrderCreated(null);
                                            setIsOpen(false);
                                        }}
                                        className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
            <div className="fixed inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md pointer-events-auto">
                    <div className="h-full flex flex-col bg-white shadow-xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-6 bg-leaf-50/50 border-b border-gray-100 sm:px-6">
                            <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-500"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="p-4 bg-gray-100 rounded-full">
                                        <Minus className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">Your cart is empty.</p>
                                    <button onClick={() => setIsOpen(false)} className="text-leaf-600 font-medium hover:underline">
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <ul className="space-y-6">
                                    {items.map((item) => (
                                        <li key={item.id} className="flex py-2">
                                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            </div>
                                            <div className="ml-4 flex flex-1 flex-col">
                                                <div>
                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                        <h3>{item.name}</h3>
                                                        <p className="ml-4">₹{(item.price * item.cartQuantity).toFixed(2)}</p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                                </div>
                                                <div className="flex flex-1 items-end justify-between text-sm">
                                                    <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="font-medium w-4 text-center">{item.cartQuantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="font-medium text-red-500 hover:text-red-700 flex items-center space-x-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span>Remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
                                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                                    <p>Subtotal</p>
                                    <p>₹{totalPrice.toFixed(2)}</p>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500 mb-6">
                                    Shipping and taxes calculated at checkout.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={handleCheckout}
                                        disabled={isCheckingOut}
                                        className="w-full flex items-center justify-center rounded-xl border border-transparent bg-leaf-600 px-6 py-3 text-base font-bold text-white shadow-sm hover:bg-leaf-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCheckingOut ? 'Processing...' : 'Checkout'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
