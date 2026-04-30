import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChefHat, Clock, CheckCircle, AlertCircle, Package,
  Users, TrendingUp, X, Eye, Printer
} from 'lucide-react';
import axios from 'axios';

const KitchenScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    totalItems: 0
  });
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const API_URL = 'https://pos-co0q.onrender.com/api';

  // Fetch kitchen orders on component mount
  useEffect(() => {
    fetchKitchenOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchKitchenOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch kitchen orders
  const fetchKitchenOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/kitchen/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });


      if (response.data.success) {
        setOrders(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (ordersList) => {
    const pending = ordersList.filter(o => o.status === 'confirmed').length;
    const preparing = ordersList.filter(o => o.status === 'preparing').length;
    const ready = ordersList.filter(o => o.status === 'ready').length;
    const totalItems = ordersList.reduce((sum, order) =>
      sum + (order.items?.reduce((s, item) => s + item.quantity, 0) || 0), 0
    );

    setStats({
      pendingOrders: pending,
      preparingOrders: preparing,
      readyOrders: ready,
      totalItems: totalItems
    });
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/kitchen/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchKitchenOrders();
        alert(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.error || 'Failed to update order status');
    }
  };

  // Get status color and icon
  const getStatusDetails = (status) => {
    const statusMap = {
      confirmed: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock size={16} />,
        label: 'Pending',
        nextStatus: 'preparing',
        nextLabel: 'Start Preparing'
      },
      preparing: {
        color: 'bg-blue-100 text-blue-800',
        icon: <Package size={16} />,
        label: 'Preparing',
        nextStatus: 'ready',
        nextLabel: 'Mark as Ready'
      },
      ready: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={16} />,
        label: 'Ready',
        nextStatus: null,
        nextLabel: null
      }
    };
    return statusMap[status] || statusMap.confirmed;
  };

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMinutes = Math.floor((now - orderDate) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m ago`;
  };

  // Render order card
  const renderOrderCard = (order) => {
    const statusDetails = getStatusDetails(order.status);
    const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
      <div key={order._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                #{order.orderNumber}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={14} className="text-gray-400" />
                <p className="text-xs text-gray-500">
                  {formatTime(order.createdAt)}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusDetails.color}`}>
              {statusDetails.icon}
              {statusDetails.label}
            </span>
          </div>

          {/* Order Type & Table */}
          <div className="mb-4 pb-3 border-b">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order Type:</span>
              <span className="font-medium capitalize">{order.orderType}</span>
            </div>
            {order.tableNumber && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Table:</span>
                <span className="font-medium">Table {order.tableNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Items:</span>
              <span className="font-medium">{itemCount} items</span>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  {item.notes && (
                    <p className="text-xs text-orange-600 mt-1">Note: {item.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => {/* Mark individual item as done */ }}
                  className="text-green-600 hover:text-green-700"
                  title="Mark as done"
                >
                  <CheckCircle size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Action Button */}
          {statusDetails.nextStatus && (
            <button
              onClick={() => handleUpdateStatus(order._id, statusDetails.nextStatus)}
              className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              {statusDetails.nextLabel}
            </button>
          )}

          {/* View Details Button */}
          <button
            onClick={() => {
              setSelectedOrder(order);
              setShowOrderModal(true);
            }}
            className="w-full mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium py-1"
          >
            View Full Details →
          </button>
        </div>
      </div>
    );
  };

  // Order Details Modal
  const renderOrderDetailsModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Order ID</label>
                    <p className="font-medium">#{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Date & Time</label>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Order Type</label>
                    <p className="font-medium capitalize">{selectedOrder.orderType}</p>
                  </div>
                  {selectedOrder.tableNumber && (
                    <div>
                      <label className="text-xs text-gray-500">Table Number</label>
                      <p className="font-medium">{selectedOrder.tableNumber}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <p className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusDetails(selectedOrder.status).color}`}>
                      {getStatusDetails(selectedOrder.status).icon}
                      {getStatusDetails(selectedOrder.status).label}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Payment Status</label>
                    <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${selectedOrder.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {selectedOrder.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              {selectedOrder.customer && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Customer Details</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium">{selectedOrder.customer.name || 'Guest'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer.mobileNo || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Order Items</label>
                <div className="bg-gray-50 rounded-lg p-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        {item.notes && (
                          <p className="text-xs text-orange-600 mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.notes && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Special Instructions</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                {getStatusDetails(selectedOrder.status).nextStatus && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedOrder._id, getStatusDetails(selectedOrder.status).nextStatus);
                      setShowOrderModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {getStatusDetails(selectedOrder.status).nextLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Determine which view to show based on URL
  const currentPath = location.pathname;
  const isDashboard = currentPath === '/kitchen';
  const isOrders = currentPath === '/kitchen/orders';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {isDashboard && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Kitchen Dashboard</h2>
              <p className="text-gray-600 mt-2">Manage and track food preparation</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Preparing</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.preparingOrders}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ready for Service</p>
                    <p className="text-2xl font-bold text-green-600">{stats.readyOrders}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.totalItems}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/kitchen/orders')}
                    className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-orange-600" />
                      <span>View All Orders</span>
                    </div>
                    <span className="text-orange-600">→</span>
                  </button>
                  <button
                    onClick={() => fetchKitchenOrders()}
                    className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-blue-600" />
                      <span>Refresh Orders</span>
                    </div>
                    <span className="text-blue-600">→</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Orders to Prepare:</span>
                    <span className="font-semibold text-yellow-600">{stats.pendingOrders + stats.preparingOrders}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Completed Orders:</span>
                    <span className="font-semibold text-green-600">{stats.readyOrders}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Items to Cook:</span>
                    <span className="font-semibold text-orange-600">{stats.totalItems}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Orders View */}
        {isOrders && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Kitchen Orders</h2>
                <p className="text-gray-600 mt-1">Manage food preparation workflow</p>
              </div>
              <button
                onClick={fetchKitchenOrders}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <Clock size={16} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">No orders to display</p>
                <p className="text-sm text-gray-400 mt-1">All caught up! New orders will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(order => renderOrderCard(order))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && renderOrderDetailsModal()}
    </div>
  );
};

export default KitchenScreen;