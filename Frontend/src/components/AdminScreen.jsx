import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, DollarSign, TrendingUp, Users, ShoppingCart, X,
  Package, Clock, CheckCircle, AlertCircle, Eye, Printer, Calendar, Download,
  Table as TableIcon, Coffee, RefreshCw , IndianRupee
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import axios from 'axios';

const AdminScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch, fetchMenu, fetchOrders } = useRestaurant();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Table Management State
  const [tables, setTables] = useState([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableFormData, setTableFormData] = useState({
    tableNumber: '',
    capacity: '',
    section: 'indoor',
    status: 'available'
  });

  // Determine which view to show based on URL path
  const currentPath = location.pathname;
  const isMenuManagement = currentPath === '/admin/menu';
  const isOrderManagement = currentPath === '/admin/orders';
  const isReports = currentPath === '/admin/reports';
  const isTableManagement = currentPath === '/admin/tables';

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    dailySales: { totalSales: 0, totalOrders: 0, averageOrderValue: 0 },
    topItems: [],
    staffPerformance: [],
    recentOrders: []
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: '',
    category: 'main',
    available: true,
    isVegetarian: false,
    preparationTime: 15
  });

  const API_URL = 'https://pos-co0q.onrender.com/api';

  // Category mapping for display
  const categories = [
    { value: 'starter', label: 'Starters' },
    { value: 'main', label: 'Main Courses' },
    { value: 'dessert', label: 'Desserts' },
    { value: 'beverage', label: 'Beverages' },
    { value: 'snack', label: 'Snacks' }
  ];

  // Section options for tables
  const sections = [
    { value: 'indoor', label: 'Indoor' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'private', label: 'Private Room' },
    { value: 'balcony', label: 'Balcony' }
  ];

  // Status options for tables
  const tableStatuses = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
    { value: 'occupied', label: 'Occupied', color: 'bg-red-100 text-red-800' },
    { value: 'reserved', label: 'Reserved', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-gray-100 text-gray-800' }
  ];

  // Fetch tables
  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_URL}/tables`);
      if (response.data.success) {
        setTables(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  // Create table
  const handleCreateTable = async () => {
    if (!tableFormData.tableNumber || !tableFormData.capacity) {
      setError('Please fill in all required fields');
      return;
    }

    setTableLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/tables`,
        {
          tableNumber: parseInt(tableFormData.tableNumber),
          capacity: parseInt(tableFormData.capacity),
          section: tableFormData.section,
          status: tableFormData.status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchTables();
        resetTableForm();
        setShowTableModal(false);
        alert('Table added successfully!');
      }
    } catch (error) {
      console.error('Error creating table:', error);
      setError(error.response?.data?.error || 'Failed to add table');
    } finally {
      setTableLoading(false);
    }
  };

  // Update table
  const handleUpdateTable = async () => {
    if (!tableFormData.tableNumber || !tableFormData.capacity || !editingTable) {
      setError('Please fill in all required fields');
      return;
    }

    setTableLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/tables/${editingTable._id}`,
        {
          tableNumber: parseInt(tableFormData.tableNumber),
          capacity: parseInt(tableFormData.capacity),
          section: tableFormData.section,
          status: tableFormData.status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchTables();
        resetTableForm();
        setShowTableModal(false);
        setEditingTable(null);
        alert('Table updated successfully!');
      }
    } catch (error) {
      console.error('Error updating table:', error);
      setError(error.response?.data?.error || 'Failed to update table');
    } finally {
      setTableLoading(false);
    }
  };

  // Delete table
  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/tables/${tableId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchTables();
        alert('Table deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      alert(error.response?.data?.error || 'Failed to delete table');
    }
  };

  // Update table status
  const handleUpdateTableStatus = async (tableId, newStatus) => {
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
      console.error('Error updating table status:', error);
      alert(error.response?.data?.error || 'Failed to update table status');
    }
  };

  const resetTableForm = () => {
    setTableFormData({
      tableNumber: '',
      capacity: '',
      section: 'indoor',
      status: 'available'
    });
    setError('');
  };

  const openTableModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setTableFormData({
        tableNumber: table.tableNumber.toString(),
        capacity: table.capacity.toString(),
        section: table.section,
        status: table.status
      });
    } else {
      setEditingTable(null);
      resetTableForm();
    }
    setShowTableModal(true);
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchMenu();
    fetchOrders();
    fetchDashboardStats();
    fetchTables();
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('token');

      const salesResponse = await axios.get(`${API_URL}/reports/daily-sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const topItemsResponse = await axios.get(`${API_URL}/reports/top-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const staffResponse = await axios.get(`${API_URL}/reports/staff-performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboardStats({
        dailySales: salesResponse.data.data,
        topItems: topItemsResponse.data.data,
        staffPerformance: staffResponse.data.data,
        recentOrders: (state.orders || []).slice(-10).reverse()
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!formData.name || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/menu`,
        {
          name: formData.name,
          description: formData.description,
          image: formData.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          price: parseFloat(formData.price),
          category: formData.category,
          available: formData.available,
          isVegetarian: formData.isVegetarian,
          preparationTime: parseInt(formData.preparationTime)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchMenu();
        resetForm();
        setShowAddModal(false);
        alert('Menu item added successfully!');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError(error.response?.data?.error || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      image: item.image || '',
      price: item.price.toString(),
      category: item.category,
      available: item.available,
      isVegetarian: item.isVegetarian || false,
      preparationTime: item.preparationTime || 15
    });
    setShowAddModal(true);
  };

  const handleUpdateItem = async () => {
    if (!formData.name || !formData.price || !editingItem) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/menu/${editingItem._id || editingItem.id}`,
        {
          name: formData.name,
          description: formData.description,
          image: formData.image,
          price: parseFloat(formData.price),
          category: formData.category,
          available: formData.available,
          isVegetarian: formData.isVegetarian,
          preparationTime: parseInt(formData.preparationTime)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchMenu();
        resetForm();
        setShowAddModal(false);
        setEditingItem(null);
        alert('Menu item updated successfully!');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError(error.response?.data?.error || 'Failed to update menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/menu/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchMenu();
        alert('Menu item deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert(error.response?.data?.error || 'Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchOrders();
        await fetchDashboardStats();
        alert(`Order status updated to ${newStatus}`);
        if (showOrderDetailsModal) {
          setShowOrderDetailsModal(false);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.error || 'Failed to update order status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      price: '',
      category: 'main',
      available: true,
      isVegetarian: false,
      preparationTime: 15
    });
    setError('');
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    resetForm();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      served: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      default: return <Package size={16} />;
    }
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

  // Menu Management View
  const renderMenuManagement = () => {
    if (state.loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      );
    }

    const menuItems = state.menu || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Menu Management</h3>
            <p className="text-gray-600 mt-1">Add, edit, or remove menu items</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add New Item
          </button>
        </div>

        {menuItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 mb-4">No menu items found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Add Your First Menu Item
            </button>
          </div>
        ) : (
          categories.map(category => {
            const itemsInCategory = menuItems.filter(item => item.category === category.value);
            if (itemsInCategory.length === 0) return null;

            return (
              <div key={category.value} className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">{category.label}</h4>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {itemsInCategory.map(item => (
                          <tr key={item._id || item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300';
                                }}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-gray-500">{item.description}</div>
                              )}
                              {item.isVegetarian && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                  Veg
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-green-600">₹{item.price.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {item.available ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item._id || item.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Order Management View
  const renderOrderManagement = () => {
    const orders = state.orders || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Order Management</h3>
            <p className="text-gray-600 mt-1">View and manage all customer orders</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order._id || order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{order.orderNumber || order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.customer?.name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{order.customer?.mobileNo || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize text-sm text-gray-900">{order.orderType || order.type}</span>
                        {order.tableNumber && (
                          <div className="text-xs text-gray-500">Table {order.tableNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">₹{order.total.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <select
                              onChange={(e) => handleUpdateOrderStatus(order._id || order.id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                              value={order.status}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="served">Served</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Table Management View
  const renderTableManagement = () => {
    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const reservedTables = tables.filter(t => t.status === 'reserved').length;

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Table Management</h3>
            <p className="text-gray-600 mt-1">Manage restaurant tables and seating arrangements</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchTables}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => openTableModal()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Add New Table
            </button>
          </div>
        </div>

        {/* Table Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold text-green-600">{tables.length}</p>
              </div>
              <TableIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableTables}</p>
              </div>
              <Coffee className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-red-600">{occupiedTables}</p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reserved</p>
                <p className="text-2xl font-bold text-yellow-600">{reservedTables}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        {tables.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <TableIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No tables found</p>
            <button
              onClick={() => openTableModal()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Add Your First Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map(table => (
              <div key={table._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">Table {table.tableNumber}</h4>
                      <p className="text-sm text-gray-600">Capacity: {table.capacity} seats</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{table.section} Section</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getTableStatusColor(table.status)}`}>
                      {table.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openTableModal(table)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table._id)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs text-gray-500 block mb-1">Quick Status Update</label>
                      <select
                        onChange={(e) => handleUpdateTableStatus(table._id, e.target.value)}
                        value={table.status}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-red-500 focus:border-red-500"
                      >
                        {tableStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
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
              <button onClick={() => setShowOrderDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Order ID</label>
                  <p className="font-medium">#{selectedOrder.orderNumber || selectedOrder.id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Date</label>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Order Type</label>
                  <p className="font-medium capitalize">{selectedOrder.orderType || selectedOrder.type}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <p className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </p>
                </div>
              </div>

              {selectedOrder.customer && (
                <div>
                  <label className="text-xs text-gray-500">Customer Details</label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1">
                    <p className="font-medium">{selectedOrder.customer.name || 'Guest'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer.mobileNo}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500">Order Items</label>
                <div className="bg-gray-50 rounded-lg p-3 mt-1">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal?.toFixed(2) || selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (5%):</span>
                      <span>₹{selectedOrder.tax?.toFixed(2) || (selectedOrder.total * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold mt-2">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Payment Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedOrder.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                  {selectedOrder.paymentMethod && (
                    <span className="ml-2 text-sm text-gray-600">via {selectedOrder.paymentMethod}</span>
                  )}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <label className="text-xs text-gray-500">Notes</label>
                  <p className="text-sm mt-1">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Print Receipt
                </button>
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id || selectedOrder.id, 'completed')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Table Modal
  const renderTableModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h3>
              <button onClick={() => {
                setShowTableModal(false);
                setEditingTable(null);
                resetTableForm();
              }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number *
                </label>
                <input
                  type="number"
                  value={tableFormData.tableNumber}
                  onChange={(e) => setTableFormData({ ...tableFormData, tableNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter table number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity (seats) *
                </label>
                <input
                  type="number"
                  value={tableFormData.capacity}
                  onChange={(e) => setTableFormData({ ...tableFormData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter seating capacity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  value={tableFormData.section}
                  onChange={(e) => setTableFormData({ ...tableFormData, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  {sections.map(section => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={tableFormData.status}
                  onChange={(e) => setTableFormData({ ...tableFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  {tableStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTableModal(false);
                  setEditingTable(null);
                  resetTableForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingTable ? handleUpdateTable : handleCreateTable}
                disabled={tableLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {tableLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    {editingTable ? 'Update' : 'Add'} Table
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Reports View
  const renderReports = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">Reports & Analytics</h3>
        <p className="text-gray-600 mt-1">View sales reports and performance metrics</p>
      </div>

      {statsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{dashboardStats.dailySales.totalSales?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-gray-500 mt-1">{dashboardStats.dailySales.totalOrders || 0} orders today</p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{dashboardStats.dailySales.averageOrderValue?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-amber-600">{state.orders?.length || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Staff Members</p>
                  <p className="text-2xl font-bold text-purple-600">{dashboardStats.staffPerformance?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Top Selling Items</h4>
            </div>
            <div className="p-6">
              {dashboardStats.topItems?.length === 0 ? (
                <p className="text-gray-500 text-center">No sales data available</p>
              ) : (
                <div className="space-y-3">
                  {dashboardStats.topItems?.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.quantity} units sold</p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-600">${item.revenue?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Staff Performance</h4>
            </div>
            <div className="overflow-x-auto">
              {dashboardStats.staffPerformance?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No staff data available</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders Processed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Generated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardStats.staffPerformance?.map((staff, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{staff.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.totalOrders || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{staff.totalRevenue?.toFixed(2) || '0.00'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {staff.lastActive ? new Date(staff.lastActive).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Main render based on URL path
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {isMenuManagement && renderMenuManagement()}
      {isOrderManagement && renderOrderManagement()}
      {isTableManagement && renderTableManagement()}
      {isReports && renderReports()}

      {/* Default to dashboard if no specific path */}
      {!isMenuManagement && !isOrderManagement && !isTableManagement && !isReports && (
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your restaurant</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Menu Items</p>
                  <p className="text-3xl font-bold">{state.menu?.length || 0}</p>
                </div>
                <Package size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Orders</p>
                  <p className="text-3xl font-bold">{state.orders?.length || 0}</p>
                </div>
                <ShoppingCart size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Today's Revenue</p>
                  <p className="text-3xl font-bold">₹{dashboardStats.dailySales.totalSales?.toFixed(2) || '0'}</p>
                </div>
               <IndianRupee size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Tables</p>
                  <p className="text-3xl font-bold">{tables.length}</p>
                </div>
                <TableIcon size={32} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/admin/menu')}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-red-600" />
                    <span>Manage Menu Items</span>
                  </div>
                  <span className="text-red-600">→</span>
                </button>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={20} className="text-blue-600" />
                    <span>View All Orders</span>
                  </div>
                  <span className="text-blue-600">→</span>
                </button>
                <button
                  onClick={() => navigate('/admin/tables')}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <TableIcon size={20} className="text-green-600" />
                    <span>Manage Tables</span>
                  </div>
                  <span className="text-green-600">→</span>
                </button>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-purple-600" />
                    <span>View Reports & Analytics</span>
                  </div>
                  <span className="text-purple-600">→</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {(state.orders || []).slice(0, 5).map(order => (
                  <div key={order._id || order.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">#{order.orderNumber || order.id}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">₹{order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Menu Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter item description"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  placeholder="15"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available for ordering</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Vegetarian</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    {editingItem ? 'Update' : 'Add'} Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && renderOrderDetailsModal()}

      {/* Table Modal */}
      {showTableModal && renderTableModal()}
    </div>
  );
};

export default AdminScreen;