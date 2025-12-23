import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Star, Clock, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const shopsRef = React.useRef(null);

    const [locationError, setLocationError] = useState(null);
    const [userCity, setUserCity] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    // Function to extract city from coordinates using reverse geocoding
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

    // Scroll to shops section
    const scrollToShops = () => {
        if (shopsRef.current) {
            shopsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchShops = async () => {
            try {
                // Try to get user location with a timeout
                if (navigator.geolocation) {
                    const geolocationTimeout = setTimeout(() => {
                        // Timeout: fetch all shops if geolocation takes too long
                        console.warn("Geolocation request timed out, fetching all shops");
                        api.shops.getAll().then(data => {
                            setShops(data);
                            setLoading(false);
                        }).catch(err => {
                            console.error("Failed to fetch shops", err);
                            setLoading(false);
                        });
                    }, 5000); // 5 second timeout

                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            clearTimeout(geolocationTimeout);
                            const { latitude, longitude } = position.coords;
                            try {
                                // Update user location in backend
                                await api.user.updateLocation(latitude, longitude).catch(err => console.log("Logged out or error updating location:", err));

                                // Get city from coordinates
                                const city = await getCityFromCoordinates(latitude, longitude);
                                if (city) {
                                    setUserCity(city);
                                    setUserLocation(city);
                                    const data = await api.shops.getNearby(latitude, longitude, city);
                                    setShops(data);
                                } else {
                                    // Fallback without city filter
                                    const data = await api.shops.getNearby(latitude, longitude);
                                    setShops(data);
                                }
                            } catch (err) {
                                console.error("Failed to fetch nearby shops", err);
                                // Fallback
                                const data = await api.shops.getAll();
                                setShops(data);
                            } finally {
                                setLoading(false);
                            }
                        },
                        (error) => {
                            clearTimeout(geolocationTimeout);
                            console.warn("Geolocation error", error);
                            setLocationError("Location access denied. Showing all shops.");
                            api.shops.getAll().then(data => {
                                setShops(data);
                            }).catch(err => {
                                console.error("Failed to fetch shops", err);
                            }).finally(() => {
                                setLoading(false);
                            });
                        }
                    );
                } else {
                    // Fallback - no geolocation support
                    try {
                        const data = await api.shops.getAll();
                        setShops(data);
                    } catch (err) {
                        console.error("Failed to fetch shops", err);
                    } finally {
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-leaf-600 to-leaf-500 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
                    <div className="md:w-2/3">
                        {/* Location Card */}
                        {userLocation && (
                            <div className="flex items-center space-x-2 mb-4 text-white/90">
                                <MapPin className="h-5 w-5" />
                                <span className="text-sm font-medium">Delivering to: <strong>{userLocation}</strong></span>
                            </div>
                        )}
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                            Fresh Groceries Delivered <br />
                            <span className="text-leaf-100">From Local Shops</span>
                        </h1>
                        <p className="text-leaf-50 text-lg mb-8 max-w-xl">
                            Support local shopkeepers and get farm-fresh produce, dairy, and bakery items delivered in minutes.
                        </p>
                        <button 
                            onClick={scrollToShops}
                            className="bg-carrot-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-carrot-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Explore Shops
                        </button>
                    </div>
                </div>
                {/* Abstract Fruit Illustration */}
                <div className="absolute right-0 bottom-0 opacity-20 transform translate-y-1/4 translate-x-1/4">
                    <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.4,33.1C60.6,44.7,50.3,55,38.6,63.4C26.9,71.8,13.8,78.3,-0.7,79.5C-15.2,80.7,-31.1,76.6,-44.6,68.8C-58.1,61,-69.2,49.5,-76.9,36.2C-84.6,22.9,-88.9,7.8,-86.6,-6.4C-84.3,-20.6,-75.4,-33.9,-64.3,-44.1C-53.2,-54.3,-39.9,-61.4,-26.8,-69.1C-13.7,-76.8,-0.8,-85.1,13.2,-87.3C27.2,-89.5,56.1,-85.6,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>

            {/* Popular Shops Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" ref={shopsRef}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-display font-semibold text-gray-800">
                            Nearby Shops {userCity && <span className="text-leaf-600 text-lg">in {userCity}</span>}
                        </h2>
                        {locationError && <p className="text-xs text-amber-600 mt-1">{locationError}</p>}
                    </div>
                    <button className="text-leaf-600 font-medium hover:text-leaf-700 text-sm flex items-center">
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                                <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.map((shop) => (
                            <div
                                key={shop.id}
                                onClick={() => navigate(`/shop/${shop.id}`)}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer"
                            >
                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                    <img
                                        src={shop.image}
                                        alt={shop.name}
                                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { (e.target).src = 'https://placehold.co/400?text=Shop'; }}
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg text-leaf-700 shadow-sm flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-current" /> {shop.rating}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{shop.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                                        {shop.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {shop.deliveryTime}
                                        </div>
                                        <div className="flex items-center gap-1 text-leaf-600 font-medium">
                                            Visit Shop <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
