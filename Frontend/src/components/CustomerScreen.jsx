import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import {
  ChefHat, LogOut, ShoppingBag, Heart, Clock, MapPin,
  Phone, Mail, User, Home, Menu, CreditCard, History,
  Star, TrendingUp, Coffee, Award, Package, Bell,
  ChevronRight, DollarSign, Calendar, CheckCircle, XCircle , IndianRupee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomerScreen = () => {
  const { user, logout } = useAuth();
  const { state, fetchMenu } = useRestaurant();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const calculateStats = (ordersList) => {
    const totalOrders = ordersList.length;
    const totalSpent = ordersList.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = ordersList.filter(o => o.status === 'completed' || o.status === 'served').length;
    const cancelledOrders = ordersList.filter(o => o.status === 'cancelled').length;
    const pendingOrders = ordersList.filter(o => !['completed', 'served', 'cancelled'].includes(o.status)).length;

    setStats({
      totalOrders,
      totalSpent,
      completedOrders,
      cancelledOrders,
      pendingOrders
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/customer/login');
  };

  const handleOrderNow = () => {
    navigate('/customer/order');
  };

  // Get recent orders (last 5)
  const recentOrders = orders.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/customer/dashboard')}>
              <div className="bg-red-600 p-2 rounded-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">FoodieHub</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium hidden md:block">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              <NavItem 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
                icon={<Home size={20} />}
                label="Dashboard"
              />
              <NavItem 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')}
                icon={<ShoppingBag size={20} />}
                label="My Orders"
              />
              <NavItem 
                active={activeTab === 'favorites'} 
                onClick={() => setActiveTab('favorites')}
                icon={<Heart size={20} />}
                label="Favorites"
              />
              <NavItem 
                active={activeTab === 'addresses'} 
                onClick={() => setActiveTab('addresses')}
                icon={<MapPin size={20} />}
                label="Addresses"
              />
              <NavItem 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
                icon={<User size={20} />}
                label="Profile"
              />
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <DashboardContent 
                user={user} 
                stats={stats}
                recentOrders={recentOrders}
                onOrderNow={handleOrderNow}
              />
            )}
            {activeTab === 'orders' && <OrdersContent orders={orders} />}
            {activeTab === 'favorites' && <FavoritesContent />}
            {activeTab === 'addresses' && <AddressesContent />}
            {activeTab === 'profile' && <ProfileContent user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-red-50 text-red-600 font-medium' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

// Dashboard Content - Professional with Real Metrics
const DashboardContent = ({ user, stats, recentOrders, onOrderNow }) => {
  // Get today's orders
  const today = new Date().toDateString();
  const todayOrders = recentOrders.filter(order => 
    new Date(order.createdAt).toDateString() === today
  );
  const todaySpent = todayOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your order summary</p>
        </div>
        <button
          onClick={onOrderNow}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          Order Now
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Stats Section - Clean Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.totalOrders}</span>
          </div>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <IndianRupee size={20} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">₹{stats.totalSpent.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500">Total Spent</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stats.completedOrders}</span>
          </div>
          <p className="text-sm text-gray-500">Completed Orders</p>
        </div>

        {/* Today's Spending */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">₹{todaySpent.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500">Today's Spending</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest order activity</p>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('switchToOrders'))}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            View All →
          </button>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No orders yet</p>
            <button 
              onClick={onOrderNow}
              className="mt-3 text-red-600 hover:text-red-700 font-medium"
            >
              Place your first order →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-800">₹{order.total.toFixed(2)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' || order.status === 'served'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Favorites</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Quick access to your favorite items</p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('switchToFavorites'))}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            Manage Favorites →
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Saved Addresses</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Manage your delivery locations</p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('switchToAddresses'))}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            Manage Addresses →
          </button>
        </div>
      </div>
    </div>
  );
};

// Orders Content Component
const OrdersContent = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-4">Your order history will appear here</p>
        <button 
          onClick={() => window.location.href = '/customer/order'}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Start Ordering
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">All Orders</h2>
        <p className="text-sm text-gray-500 mt-1">Complete order history</p>
      </div>
      <div className="divide-y divide-gray-100">
        {orders.map((order) => (
          <div key={order._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
              <div>
                <p className="font-medium text-gray-800">#{order.orderNumber}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.status === 'completed' || order.status === 'served'
                  ? 'bg-green-100 text-green-700'
                  : order.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-600">
                {order.items?.length} items • {order.orderType}
              </div>
              <span className="font-semibold text-gray-800">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Favorites Content
const FavoritesContent = () => {
  const favorites = [
    { id: 1, name: 'Margherita Pizza', price: 12.99, rating: 4.8 },
    { id: 2, name: 'Chicken Burger', price: 9.99, rating: 4.6 },
    { id: 3, name: 'Chocolate Cake', price: 6.99, rating: 4.9 },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">My Favorites</h2>
        <p className="text-sm text-gray-500 mt-1">Your saved favorite items</p>
      </div>
      <div className="divide-y divide-gray-100">
        {favorites.map(item => (
          <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div>
              <h3 className="font-medium text-gray-800">{item.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-green-600">${item.price}</span>
                <span className="text-xs text-gray-500">⭐ {item.rating}</span>
              </div>
            </div>
            <button className="text-red-500 hover:text-red-600 transition-colors">
              <Heart size={18} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Addresses Content
const AddressesContent = () => {
  const [addresses] = useState([
    { id: 1, type: 'Home', address: '123 Main Street, New York, NY 10001', default: true },
    { id: 2, type: 'Office', address: '456 Business Ave, New York, NY 10002', default: false },
  ]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Saved Addresses</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your delivery locations</p>
        </div>
        <button className="text-sm text-red-600 hover:text-red-700 font-medium">
          + Add New
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {addresses.map(addr => (
          <div key={addr.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="font-medium text-gray-800">{addr.type}</span>
                {addr.default && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>
                )}
              </div>
              <button className="text-sm text-gray-400 hover:text-gray-600">Edit</button>
            </div>
            <p className="text-sm text-gray-600 ml-6">{addr.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile Content
const ProfileContent = ({ user }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
        <p className="text-sm text-gray-500 mt-1">Your personal information</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <User size={20} className="text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Full Name</p>
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <Mail size={20} className="text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Email Address</p>
            <p className="text-sm font-medium text-gray-800">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <Phone size={20} className="text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Mobile Number</p>
            <p className="text-sm font-medium text-gray-800">{user?.mobileNo || 'Not provided'}</p>
          </div>
        </div>
        <button className="w-full mt-4 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default CustomerScreen;