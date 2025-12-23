import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Store, Package, ArrowRight, MapPin } from 'lucide-react';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState({ shops: [], items: [] });
    const [filteredResults, setFilteredResults] = useState({ shops: [], items: [] });
    const [loading, setLoading] = useState(true);
    const [userCity, setUserCity] = useState(null);

    // Function to get city from coordinates
    const getCityFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || null;
            return city;
        } catch (error) {
            console.warn("Failed to get city from coordinates:", error);
            return null;
        }
    };

    useEffect(() => {
        // Get user's location first
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const city = await getCityFromCoordinates(latitude, longitude);
                if (city) {
                    setUserCity(city);
                }
            }, (error) => {
                console.warn("Geolocation error:", error);
                // Continue without location filtering
            });
        }
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const data = await api.search(query);
                setResults(data);

                // Filter results by user's city if available
                if (userCity) {
                    const filteredShops = data.shops.filter(shop => 
                        shop.City && shop.City.toLowerCase() === userCity.toLowerCase()
                    );
                    const filteredItems = data.items.filter(item => {
                        // Items are filtered by shops in user's city
                        // We need to check if the item's shop is in user's city
                        // For now, filter items whose shop is in filtered shops
                        return filteredShops.some(shop => shop.id === item.shopId);
                    });
                    setFilteredResults({ shops: filteredShops, items: filteredItems });
                } else {
                    // No location filter, show all results
                    setFilteredResults(data);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query, userCity]);

    if (loading) return (
        <div className="min-h-screen pt-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    Search Results for "{query}"
                </h1>
                {userCity && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-leaf-600" />
                        Showing results from shops in <strong>{userCity}</strong>
                    </p>
                )}
            </div>

            {/* Shops Section */}
            {filteredResults.shops.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Store className="h-5 w-5 mr-2 text-leaf-600" /> Matching Shops
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResults.shops.map(shop => (
                            <Link to={`/shop/${shop.id}`} key={shop.id} className="block group">
                                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden h-full flex flex-col">
                                    <div className="h-40 bg-gray-100 relative">
                                        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{shop.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{shop.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Products Section */}
            {filteredResults.items.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-leaf-600" /> Matching Products
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredResults.items.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-48 bg-gray-100 relative">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                            <p className="text-xs text-gray-500 truncate">in {item.category}</p>
                                        </div>
                                        <span className="font-bold text-leaf-600">${item.price.toFixed(2)}</span>
                                    </div>
                                    {/* Link to Shop */}
                                    <Link to={`/shop/${item.shopId}`} className="mt-3 block w-full text-center py-2 rounded-lg bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                        View in Shop <ArrowRight className="inline-block h-3 w-3 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {filteredResults.shops.length === 0 && filteredResults.items.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl">
                    {userCity ? (
                        <p className="text-gray-500 text-lg">No results found for "{query}" in {userCity}. Try searching for something else or browsing all shops.</p>
                    ) : (
                        <p className="text-gray-500 text-lg">No results found for "{query}". Try checking your spelling or search for something else.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
