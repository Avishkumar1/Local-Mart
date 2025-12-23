import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(undefined);

import { useAuth } from './AuthContext';

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. Get the correct storage key based on who is logged in
    const getStorageKey = (currentUser) => {
        return currentUser ? `cart_${currentUser.id}` : 'cart_guest';
    };

    // 2. Load cart whenever the User changes (Login/Logout)
    React.useEffect(() => {
        // Prevent saving while we are switching data
        setIsInitialized(false);

        const key = getStorageKey(user);

        try {
            const savedCart = localStorage.getItem(key);
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error("Failed to load cart", error);
            setItems([]);
        } finally {
            // Only allow saving AFTER we have finished loading
            setIsInitialized(true);
        }
    }, [user?.id]); // Only re-run if ID changes, not reference

    // 3. Save cart whenever Items change
    React.useEffect(() => {
        // Critical: Do not save if we haven't initialized yet
        if (!isInitialized) return;

        // EXTRA SAFETY: Ensure we don't accidentally save an empty array over a valid cart 
        // immediately after a user switch if state updates lag
        const key = getStorageKey(user);

        localStorage.setItem(key, JSON.stringify(items));
    }, [items, user?.id, isInitialized]);

    // Conflict Management State
    const [conflictItem, setConflictItem] = useState(null);
    const [showConflictModal, setShowConflictModal] = useState(false);

    const addToCart = (product) => {
        // Check for Shop Conflict
        if (items.length > 0) {
            const currentShopId = items[0].shopId;
            if (currentShopId && product.shopId && currentShopId !== product.shopId) {
                // Conflict detected!
                setConflictItem(product);
                setShowConflictModal(true);
                return;
            }
        }

        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
                );
            }
            return [...prev, { ...product, cartQuantity: 1 }];
        });
        setIsOpen(true);
    };

    const replaceCart = () => {
        if (conflictItem) {
            setItems([{ ...conflictItem, cartQuantity: 1 }]);
            setConflictItem(null);
            setShowConflictModal(false);
            setIsOpen(true);
        }
    };

    const cancelConflict = () => {
        setConflictItem(null);
        setShowConflictModal(false);
    };

    const removeFromCart = (productId) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === productId ? { ...item, cartQuantity: quantity } : item))
        );
    };

    const clearCart = () => setItems([]);

    const totalPrice = items.reduce((acc, item) => acc + item.price * item.cartQuantity, 0);
    const totalItems = items.reduce((acc, item) => acc + item.cartQuantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalPrice,
                totalItems,
                isOpen,
                setIsOpen,
            }}
        >
            {children}

            {/* Shop Conflict Modal */}
            {showConflictModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Start a new basket?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Your basket contains items from another shop. Do you want to clear your current basket and add this item?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelConflict}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={replaceCart}
                                className="flex-1 px-4 py-2 bg-leaf-600 text-white rounded-xl font-bold hover:bg-leaf-700 transition-colors shadow-md"
                            >
                                Replace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
