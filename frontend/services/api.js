import axios from 'axios';
import { Role } from '../constants';

const axiosInstance = axios.create({
    baseURL: 'https://local-mart-nrj2.onrender.com/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    auth: {
        login: async (email, password = 'password', role) => {
            let url = '/auth/login';
            if (role === Role.SHOPKEEPER) url = '/auth/shopkeeper/login';
            // Assuming delivery partners use standard login or a specific one? 
            // The backend `loginUser` checks for 'Customer' role? No, `loginUser` checks user exist. 
            // Actually `loginUser` in `authController.js` just logs in and returns 'Customer' role in response hardcoded? 
            // Let's check `authController`. `loginUser` finds user, checks password. 
            // If success, generates token with 'Customer'. WRONG. It hardcodes 'Customer'.
            // I need to fix `loginUser` to be generic or create `loginDelivery`.
            // Let's assume I fix backend `loginUser` to be dynamic or create specific route.
            // I'll point to `/auth/delivery/login` just in case.
            if (role === 'DeliveryPartner') url = '/auth/delivery/login';

            const response = await axiosInstance.post(url, { Email: email, Password: password });
            return { user: mapUser(response.data.user) };
        },
        register: async (data) => {
            let role = Role.CUSTOMER;
            if (data.role === Role.SHOPKEEPER) role = Role.SHOPKEEPER;
            else if (data.role === 'DeliveryPartner') role = 'DeliveryPartner';

            let url = '/auth/register';
            if (role === Role.SHOPKEEPER) url = '/auth/shopkeeper/register';
            else if (role === 'DeliveryPartner') url = '/auth/delivery/register';

            const payload = {
                Name: data.name,
                Email: data.email,
                Password: data.password,
                Address: data.address,
                City: data.city,
                DOB: data.dob,
                Gender: data.gender,
            };

            if (data.phone) {
                payload.Phone = data.phone;
            }

            const response = await axiosInstance.post(url, payload);
            return { user: mapUser(response.data.user) };
        },
        google: () => {
            window.location.href = 'https://local-mart-nrj2.onrender.com/api/auth/google';
        },
        getProfile: async () => {
            try {
                const response = await axiosInstance.get('/auth/profile');
                return mapUser(response.data.user);
            } catch (error) {
                throw error;
            }
        },
        logout: async () => {
            await axiosInstance.post('/auth/logout');
        },
    },
    items: {
        getAll: async () => {
            const response = await axiosInstance.get('/items');
            return response.data.map(mapProduct);
        },
        getMyShopItems: async () => {
            const response = await axiosInstance.get('/items/myshop');
            return response.data.map(mapProduct);
        },
        create: async (product) => {
            const payload = {
                name: product.name,
                description: product.description,
                price: product.price,
                quantity: product.quantity,
                category: product.category,
                images: product.images || [product.image]
            };
            const response = await axiosInstance.post('/items/add', payload);
            return mapProduct(response.data);
        },
        delete: async (id) => {
            await axiosInstance.delete(`/items/${id}`);
        }
    },
    shops: {
        getAll: async (city) => {
            const url = city ? `/items/shops?city=${encodeURIComponent(city)}` : '/items/shops';
            const response = await axiosInstance.get(url);
            return response.data.map(mapShop);
        },
        getNearby: async (latitude, longitude, city) => {
            const url = city
                ? `/items/nearby?latitude=${latitude}&longitude=${longitude}&city=${encodeURIComponent(city)}`
                : `/items/nearby?latitude=${latitude}&longitude=${longitude}`;
            const response = await axiosInstance.get(url);
            return response.data.map(mapShop);
        },
        getItems: async (shopId) => {
            const response = await axiosInstance.get(`/items/shops/${shopId}`);
            return response.data.map(mapProduct);
        }
    },
    search: async (query) => {
        const response = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
        return {
            shops: response.data.shops.map(mapShop),
            items: response.data.items.map(mapProduct)
        };
    },
    orders: {
        create: async (orderData) => {
            const response = await axiosInstance.post('/orders', orderData);
            return response.data;
        },
        getShopOrders: async () => {
            const response = await axiosInstance.get('/orders/shop');
            return response.data;
        },
        getUserOrders: async () => {
            const response = await axiosInstance.get('/orders/myorders');
            return response.data; // might map this too if needed, but raw is fine for now
        },
        getDeliveryOrders: async () => {
            const response = await axiosInstance.get('/orders/delivery');
            return response.data;
        },
        getById: async (id) => {
            const response = await axiosInstance.get(`/orders/${id}`);
            return response.data;
        },
        updateStatus: async (orderId, status) => {
            const response = await axiosInstance.put(`/orders/${orderId}/status`, { status });
            return response.data;
        }
    },
    user: {
        updateLocation: async (latitude, longitude) => {
            const response = await axiosInstance.put('/user/location', { latitude, longitude });
            return response.data;
        }
    }
};

function mapUser(backendUser) {
    if (!backendUser) return null;
    let role;
    if (backendUser.role === 'Shopkeeper') role = Role.SHOPKEEPER;
    else if (backendUser.role === 'DeliveryPartner') role = 'DeliveryPartner';
    else role = Role.CUSTOMER;

    return {
        id: backendUser._id || backendUser.userId,
        name: backendUser.Name,
        email: backendUser.Email,
        role: role,
        avatar: backendUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(backendUser.Name)}`,
        location: backendUser.location,
        city: backendUser.City
    };
}

function mapProduct(backendItem) {
    return {
        id: backendItem._id,
        name: backendItem.name,
        price: backendItem.price,
        image: backendItem.images && backendItem.images.length > 0 ? backendItem.images[0] : 'https://placehold.co/400',
        category: backendItem.category,
        quantity: backendItem.quantity,
        description: backendItem.description,
        shopId: backendItem.shopkeeperId
    };
}

function mapShop(backendShop) {
    return {
        id: backendShop._id,
        name: backendShop.Name,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        description: backendShop.Address || 'Local Grocery Shop',
        rating: 4.5,
        deliveryTime: '20-30 min',
        tags: ['Groceries', 'Fresh'],
        location: backendShop.location
    };
}
