import axios from 'axios';
import React from 'react'

const CustomerOrders = () => {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${ 'https://pos-co0q.onrender.com/api'}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">My Orders</h2>
            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                    <button
                        onClick={() => window.location.href = '/customer/order'}
                        className="mt-4 text-blue-600 hover:text-blue-700"
                    >
                        Place Your First Order →
                    </button>
                </div>
            ) : (
                <RecentOrdersTable orders={orders} />
            )}
        </div>
    );
};

const RecentOrdersTable = ({ orders }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{order.orderNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                ₹{order.total.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' || order.status === 'served'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'cancelled'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerOrders
