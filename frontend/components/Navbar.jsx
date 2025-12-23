import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User as UserIcon, LogOut, Store, Menu, MapPin, Search } from 'lucide-react';
import { Role } from '../constants';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { totalItems, setIsOpen } = useCart();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [userLocation, setUserLocation] = React.useState(null);
    const [showMobileSearch, setShowMobileSearch] = React.useState(false);

    // Get user's location on component mount
    React.useEffect(() => {
        const getLocation = async () => {
            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const { latitude, longitude } = position.coords;
                        // Get city from reverse geocoding
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        const city = data.address?.city || data.address?.town || data.address?.village || 'Current Location';
                        setUserLocation(city);
                    });
                }
            } catch (error) {
                console.log("Location detection error:", error);
            }
        };
        getLocation();
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="bg-leaf-100 p-2 rounded-lg">
                            <Store className="h-6 w-6 text-leaf-600" />
                        </div>
                        <span className="font-display font-bold text-xl text-gray-900 tracking-tight">
                            Local<span className="text-leaf-600">Mart</span>
                        </span>
                    </Link>

                    {/* Search Bar (Hidden on Mobile) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <input
                            type="text"
                            placeholder="Search for fresh fruits, vegetables, or shops..."
                            className="w-full px-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>

                    {/* Location Display */}
                    {userLocation && (
                        <div className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-leaf-600 cursor-pointer transition-colors">
                            <MapPin className="h-4 w-4 text-leaf-600" />
                            <span className="text-sm font-medium">{userLocation}</span>
                        </div>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setShowMobileSearch(!showMobileSearch)}
                            className="md:hidden p-2 text-gray-600 hover:text-leaf-600 transition-colors rounded-full hover:bg-leaf-50"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        {user?.role === Role.SHOPKEEPER && (
                            <Link to="/shop/dashboard" className="text-sm font-medium text-gray-600 hover:text-leaf-600 transition-colors">
                                Dashboard
                            </Link>
                        )}
                        {user?.role === 'DeliveryPartner' && (
                            <Link to="/delivery/dashboard" className="text-sm font-medium text-gray-600 hover:text-leaf-600 transition-colors">
                                Dashboard
                            </Link>
                        )}

                        <button
                            onClick={() => setIsOpen(true)}
                            className="relative p-2 text-gray-600 hover:text-leaf-600 transition-colors rounded-full hover:bg-leaf-50"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-carrot-500 rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 p-1 rounded-full border border-transparent hover:border-gray-200 transition-all">
                                    <div className="h-8 w-8 rounded-full bg-leaf-100 flex items-center justify-center text-leaf-700">
                                        <UserIcon className="h-5 w-5" />
                                    </div>
                                </button>
                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                                    <div className="px-4 py-2 border-b border-gray-50">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-leaf-600"
                                    >
                                        Your Profile
                                    </Link>
                                    <Link
                                        to="/my-orders"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-leaf-600"
                                    >
                                        My Orders
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-leaf-600 hover:bg-leaf-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <span className="md:hidden"><UserIcon className="h-5 w-5" /></span>
                                <span className="hidden md:inline">Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {showMobileSearch && (
                <div className="md:hidden px-4 pb-4">
                    <input
                        type="text"
                        placeholder="Search for products or shops..."
                        className="w-full px-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                setShowMobileSearch(false);
                            }
                        }}
                        autoFocus
                    />
                </div>
            )}
        </nav>
    );
};

export default Navbar;
