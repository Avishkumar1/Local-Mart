import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ShopDetails = () => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            if (!id) return;
            try {
                const data = await api.shops.getItems(id);
                setProducts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Link to="/" className="inline-flex items-center text-leaf-600 mb-6 hover:text-leaf-800 transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" /> Back to Shops
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop Items</h1>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                                <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <h2 className="text-xl text-gray-500">No items found in this shop.</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
                            >
                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { (e.target).src = 'https://placehold.co/400?text=No+Image'; }}
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg text-leaf-700 shadow-sm">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                                        {product.description || 'No description available'}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="bg-leaf-100 text-leaf-700 p-2.5 rounded-xl hover:bg-leaf-600 hover:text-white transition-colors"
                                        >
                                            <ShoppingBag className="h-5 w-5" />
                                        </button>
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

export default ShopDetails;
