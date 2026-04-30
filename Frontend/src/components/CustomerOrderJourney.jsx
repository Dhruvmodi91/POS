import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import MenuDisplay from './MenuDisplay';
import OrderConfirmation from './OrderConfirmation';
import PaymentModal from './PaymentModal';
import axios from 'axios';

const CustomerOrderJourney = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { state, createOrder } = useRestaurant();
    const [orderType, setOrderType] = useState(null);
    const [tableNumber, setTableNumber] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        deliveredOrders: 0
    });

    const API_URL = 'https://restaurant-managment-system-2.onrender.com/api';

    const orderTypeOptions = [
        {
            type: 'dine-in',
            label: 'Dine In',
            icon: '🍽️',
            description: 'Enjoy your meal at our restaurant'
        },
        {
            type: 'takeaway',
            label: 'Takeaway',
            icon: '🥡',
            description: 'Order and pick up from our counter'
        },
        {
            type: 'delivery',
            label: 'Delivery',
            icon: '🚚',
            description: 'Get your food delivered to your doorstep'
        }
    ];

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const orders = response.data.data;
                const totalOrders = orders.length;
                const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
                const pendingOrders = orders.filter(o => !['completed', 'served', 'cancelled'].includes(o.status)).length;
                const deliveredOrders = orders.filter(o => o.status === 'completed' || o.status === 'served').length;

                setStats({
                    totalOrders,
                    totalSpent,
                    pendingOrders,
                    deliveredOrders
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleOrderTypeSelect = (type) => {
        setOrderType(type);
        if (type === 'dine-in') {
            const table = prompt('Enter Table Number (1-20):', '1');
            if (table && table >= 1 && table <= 20) {
                setTableNumber(table);
                setShowMenu(true);
            } else {
                setOrderType(null);
                alert('Please enter a valid table number (1-20)');
            }
        } else {
            setShowMenu(true);
        }
    };

    // Handle proceeding to payment - THIS IS THE MISSING FUNCTION
    const handleProceedToPayment = () => {
        if (state.cart.length === 0) {
            alert('Your cart is empty. Please add items to proceed.');
            return;
        }
        setShowPayment(true);
    };

    const handlePaymentComplete = async (paymentResult) => {
        setShowPayment(false);
        setLoading(true);

        try {
            const orderData = {
                items: state.cart.map(item => ({
                    menuItem: item.id,
                    quantity: item.quantity,
                    notes: ''
                })),
                orderType: orderType,
                tableNumber: orderType === 'dine-in' ? parseInt(tableNumber) : undefined,
                customer: {
                    name: user?.name || 'Guest',
                    email: user?.email || '',
                    mobileNo: user?.mobileNo || ''
                },
                notes: ''
            };

            const result = await createOrder(orderData);

            if (result.success) {
                setCurrentOrder(result.order);
                setShowConfirmation(true);
            } else {
                alert('Failed to place order: ' + result.error);
            }
        } catch (error) {
            console.error('Order placement error:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNewOrder = () => {
        setShowConfirmation(false);
        setCurrentOrder(null);
        setOrderType(null);
        setTableNumber('');
        setShowMenu(false);
        setShowPayment(false);
        fetchUserStats(); // Refresh stats after order
    };

    const handleBackToHome = () => {
        navigate('/customer/dashboard');
    };

    if (showConfirmation && currentOrder) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <OrderConfirmation
                        orderData={currentOrder}
                        onClose={handleNewOrder}
                    />
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Placing your order...</p>
                </div>
            </div>
        );
    }

    if (!showMenu) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-12">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-gray-500">Ready to order your favorite food?</p>
                    </div>

                    {/* Stats Section - Dashboard Style Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <div className="border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                    <span className="text-xl">📦</span>
                                </div>
                                <span className="text-3xl font-bold text-gray-800">{stats.totalOrders}</span>
                            </div>
                            <p className="text-sm text-gray-500">Total Orders</p>
                        </div>

                        <div className="border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                    <span className="text-xl">💰</span>
                                </div>
                                <span className="text-3xl font-bold text-gray-800">₹{stats.totalSpent.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-gray-500">Total Spent</p>
                        </div>

                        <div className="border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                                    <span className="text-xl">⏳</span>
                                </div>
                                <span className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</span>
                            </div>
                            <p className="text-sm text-gray-500">Pending Orders</p>
                        </div>

                        <div className="border-b border-gray-200 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                    <span className="text-xl">✅</span>
                                </div>
                                <span className="text-3xl font-bold text-gray-800">{stats.deliveredOrders}</span>
                            </div>
                            <p className="text-sm text-gray-500">Delivered Orders</p>
                        </div>
                    </div>

                    {/* Order Type Selection - Simple List */}
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">How would you like to order?</h2>
                        <div className="space-y-3">
                            {orderTypeOptions.map((option) => (
                                <button
                                    key={option.type}
                                    onClick={() => handleOrderTypeSelect(option.type)}
                                    className="w-full flex items-center justify-between p-5 bg-white border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{option.icon}</span>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-800 capitalize">{option.label}</p>
                                            <p className="text-sm text-gray-500">{option.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all">→</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="text-center">
                        <button
                            onClick={handleBackToHome}
                            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <MenuDisplay
                orderType={orderType}
                tableNumber={tableNumber}
                onBack={() => setShowMenu(false)}
                onProceedToPayment={handleProceedToPayment}
            />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
                orderData={{
                    id: currentOrder?._id || 'temp',
                    items: state.cart,
                    total: state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
                    orderType: orderType
                }}
                onPaymentComplete={handlePaymentComplete}
            />
        </div>
    );
};

export default CustomerOrderJourney;