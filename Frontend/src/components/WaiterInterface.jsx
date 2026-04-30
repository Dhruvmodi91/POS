import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Coffee, Clock, CheckCircle, XCircle,
  Users, Bell, Printer, Eye, RefreshCw, AlertCircle,
  Home, Package, TrendingUp
} from 'lucide-react';
import axios from 'axios';

const WaiterInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    activeOrders: 0,
    occupiedTables: 0,
    availableTables: 0,
    totalToday: 0
  });

  const API_URL = 'https://pos-co0q.onrender.com/api';

  // Determine which tab to show based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/waiter/tables') {
      setActiveTab('tables');
    } else if (path === '/waiter/history') {
      setActiveTab('history');
    } else {
      setActiveTab('orders');
    }
  }, [location.pathname]);

  // Fetch data on component mount
  useEffect(() => {
    fetchOrders();
    fetchTables();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
      fetchTables();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch waiter orders (active orders)
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Filter orders that are active (not completed or cancelled)
        const activeOrders = response.data.data.filter(
          order => !['completed', 'cancelled'].includes(order.status)
        );
        setOrders(activeOrders);
        calculateStats(activeOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch tables
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTables(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  // Calculate statistics
  const calculateStats = (ordersList) => {
    const activeOrders = ordersList.length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const availableTables = tables.filter(t => t.status === 'available').length;

    setStats({
      activeOrders,
      occupiedTables,
      availableTables,
      totalToday: ordersList.reduce((sum, order) => sum + order.total, 0)
    });
  };

  // Update order status (mark as served)
  const handleServeOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status: 'served' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchOrders();
        alert('Order marked as served!');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert(error.response?.data?.error || 'Failed to update order');
    }
  };

  // Update table status
  const handleTableStatus = async (tableId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/tables/${tableId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchTables();
        alert(`Table status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating table:', error);
      alert(error.response?.data?.error || 'Failed to update table status');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      served: 'bg-gray-100 text-gray-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTableStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  // Active Orders Component
  const ActiveOrders = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Active Orders</h2>
        <p className="text-sm text-gray-600 mt-1">Orders that need your attention</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">No active orders</p>
          <p className="text-sm text-gray-400 mt-1">All orders have been served</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {orders.map(order => (
            <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium text-gray-800">#{order.orderNumber}</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {order.orderType === 'dine-in' && order.tableNumber && (
                      <span className="text-xs text-gray-500">Table {order.tableNumber}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0)} items •
                    {order.orderType === 'dine-in' ? ' Dine-in' : order.orderType === 'takeaway' ? ' Takeaway' : ' Delivery'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Placed {formatTime(order.createdAt)}</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">₹{order.total.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {order.status === 'ready' && (
                      <button
                        onClick={() => handleServeOrder(order._id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle size={16} />
                        Mark as Served
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Table Status Component
  const TableStatus = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Table Status</h2>
        <button
          onClick={fetchTables}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">No tables found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map(table => (
            <div key={table._id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-lg font-bold text-gray-800">Table {table.tableNumber}</p>
                  <p className="text-sm text-gray-600">Capacity: {table.capacity} seats</p>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTableStatusColor(table.status)}`}>
                  {table.status}
                </span>
              </div>

              {table.status === 'occupied' && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    Currently occupied
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {table.status !== 'occupied' && (
                  <button
                    onClick={() => handleTableStatus(table._id, 'occupied')}
                    className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium"
                  >
                    Mark Occupied
                  </button>
                )}
                {table.status === 'occupied' && (
                  <button
                    onClick={() => handleTableStatus(table._id, 'available')}
                    className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                  >
                    Mark Available
                  </button>
                )}
                <button
                  onClick={() => handleTableStatus(table._id, 'reserved')}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs font-medium"
                >
                  Reserve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Order History Component
  const OrderHistory = () => {
    const [completedOrders, setCompletedOrders] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
      fetchCompletedOrders();
    }, []);

    const fetchCompletedOrders = async () => {
      setHistoryLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const completed = response.data.data.filter(
            order => order.status === 'served' || order.status === 'completed'
          );
          setCompletedOrders(completed);
        }
      } catch (error) {
        console.error('Error fetching completed orders:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Order History</h2>
          <p className="text-sm text-gray-600 mt-1">Completed and served orders</p>
        </div>

        {historyLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        ) : completedOrders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No order history found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {completedOrders.map(order => (
              <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-gray-800">#{order.orderNumber}</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items?.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">${order.total.toFixed(2)}</p>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
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
                    <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
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

              {selectedOrder.customer && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Customer Details</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium">{selectedOrder.customer.name || 'Guest'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer.mobileNo || 'N/A'}</p>
                  </div>
                </div>
              )}

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
                      <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-bold text-green-600">₹{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Special Instructions</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                {selectedOrder.status === 'ready' && (
                  <button
                    onClick={() => {
                      handleServeOrder(selectedOrder._id);
                      setShowOrderModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Mark as Served
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard View
  const renderDashboard = () => (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Waiter Dashboard</h2>
        <p className="text-gray-600 mt-2">Manage orders and tables efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-orange-600">{stats.activeOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupied Tables</p>
              <p className="text-2xl font-bold text-red-600">{stats.occupiedTables}</p>
            </div>
            <Users className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Tables</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableTables}</p>
            </div>
            <Coffee className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-blue-600">₹{stats.totalToday.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/waiter/orders')}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-orange-600" />
                <span>View Active Orders</span>
              </div>
              <span className="text-orange-600">→</span>
            </button>
            <button
              onClick={() => navigate('/waiter/tables')}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Coffee size={20} className="text-blue-600" />
                <span>Manage Tables</span>
              </div>
              <span className="text-blue-600">→</span>
            </button>
            <button
              onClick={() => navigate('/waiter/history')}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-green-600" />
                <span>View Order History</span>
              </div>
              <span className="text-green-600">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Active Orders:</span>
              <span className="font-semibold text-orange-600">{stats.activeOrders}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Tables in Use:</span>
              <span className="font-semibold text-red-600">{stats.occupiedTables}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Today's Revenue:</span>
              <span className="font-semibold text-green-600">₹{stats.totalToday.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Determine which view to show based on URL
  const currentPath = location.pathname;
  const isDashboard = currentPath === '/waiter';
  const isOrders = currentPath === '/waiter/orders';
  const isTables = currentPath === '/waiter/tables';
  const isHistory = currentPath === '/waiter/history';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isDashboard && renderDashboard()}
        {isOrders && <ActiveOrders />}
        {isTables && <TableStatus />}
        {isHistory && <OrderHistory />}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && renderOrderDetailsModal()}
    </div>
  );
};

export default WaiterInterface;