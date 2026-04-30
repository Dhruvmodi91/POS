import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Printer, X, CheckCircle, Clock, DollarSign, TrendingUp,
  CreditCard, AlertCircle, Package ,IndianRupee,
} from 'lucide-react';
import axios from 'axios';

const CounterScreen = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingBills, setPendingBills] = useState([]);
  const [completedBills, setCompletedBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [stats, setStats] = useState({
    todayCollection: 0,
    pendingCount: 0,
    completedCount: 0,
    totalRevenue: 0
  });

  const API_URL = 'https://pos-co0q.onrender.com/api';

  // Determine which tab to show based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/counter/history') {
      setActiveTab('completed');
    } else if (path === '/counter/billing' || path === '/counter') {
      setActiveTab('pending');
    }
  }, [location.pathname]);

  // Fetch data on component mount
  useEffect(() => {
    fetchPendingBills();
    fetchCompletedBills();
    fetchStats();
  }, []);

  // Fetch pending bills
  const fetchPendingBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/counter/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPendingBills(response.data.data);
        setStats(prev => ({ ...prev, pendingCount: response.data.count }));
      }
    } catch (error) {
      console.error('Error fetching pending bills:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch completed bills
  const fetchCompletedBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/counter/bills`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCompletedBills(response.data.data);
        setStats(prev => ({ ...prev, completedCount: response.data.count }));
      }
    } catch (error) {
      console.error('Error fetching completed bills:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];

      const billsResponse = await axios.get(`${API_URL}/counter/bills`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (billsResponse.data.success) {
        const todayBills = billsResponse.data.data.filter(bill =>
          new Date(bill.createdAt).toISOString().split('T')[0] === today
        );

        const todayTotal = todayBills.reduce((sum, bill) => sum + bill.total, 0);
        const totalRevenue = billsResponse.data.data.reduce((sum, bill) => sum + bill.total, 0);

        setStats(prev => ({
          ...prev,
          todayCollection: todayTotal,
          totalRevenue: totalRevenue,
          completedCount: billsResponse.data.data.length
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Generate bill
  const handleGenerateBill = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/counter/orders/${selectedOrder._id}/bill`,
        { paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Bill generated successfully!');
        setShowBillModal(false);
        setSelectedOrder(null);
        await fetchPendingBills();
        await fetchCompletedBills();
        await fetchStats();
        printBill(response.data.data);
      }
    } catch (error) {
      console.error('Error generating bill:', error);
      alert(error.response?.data?.error || 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  // Print bill
  const printBill = (bill) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill #${bill.billNumber || bill._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .bill-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Restaurant App</h2>
            <p>Bill Receipt</p>
          </div>
          <div class="bill-details">
            <p><strong>Bill ID:</strong> ${bill.billNumber || bill._id}</p>
            <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleString()}</p>
            <p><strong>Customer:</strong> ${bill.customer?.name || 'Guest'}</p>
            <p><strong>Payment Method:</strong> ${bill.paymentMethod}</p>
          </div>
           <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th> </tr>
            </thead>
            <tbody>
              ${bill.items?.map(item => `
                 <tr>
                   <td>${item.name}</td>
                   <td>${item.quantity}</td>
                   <td>₹${item.price.toFixed(2)}</td>
                   <td>₹${item.total.toFixed(2)}</td>
                 </tr>
              `).join('')}
            </tbody>
           </table>
          <div class="total">
            <p>Subtotal: ₹${bill.subtotal.toFixed(2)}</p>
            <p>Tax (5%): ₹${bill.tax.toFixed(2)}</p>
            ${bill.discount > 0 ? `<p>Discount: ₹${bill.discount.toFixed(2)}</p>` : ''}
            <p><strong>Total: ₹${bill.total.toFixed(2)}</strong></p>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const openBillModal = (order) => {
    setSelectedOrder(order);
    setPaymentMethod('cash');
    setShowBillModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Render Pending Bills
  const renderPendingBills = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Pending Bills</h2>
        <p className="text-sm text-gray-600 mt-1">Generate bills for completed orders</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bills...</p>
        </div>
      ) : pendingBills.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">No pending bills</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingBills.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer?.name || 'Guest'}</div>
                    <div className="text-xs text-gray-500">{order.customer?.mobileNo || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.tableNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-900">{order.orderType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openBillModal(order)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Printer size={16} />
                      Generate Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Render Completed Bills
  const renderCompletedBills = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Completed Bills</h2>
        <p className="text-sm text-gray-600 mt-1">History of all generated bills</p>
      </div>

      {completedBills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No completed bills found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {completedBills.map(bill => (
                <tr key={bill._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{bill.billNumber || bill._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{bill.order?.orderNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bill.customer?.name || 'Guest'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">₹{bill.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-900">₹{bill.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.paymentStatus)}`}>
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => printBill(bill)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Printer size={16} />
                      Reprint
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Render Bill Modal
  const renderBillModal = () => {
    if (!selectedOrder) return null;

    const subtotal = selectedOrder.subtotal || selectedOrder.total;
    const tax = selectedOrder.tax || (subtotal * 0.05);
    const total = selectedOrder.total;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Generate Bill</h3>
              <button onClick={() => setShowBillModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{selectedOrder.customer?.name || 'Guest'}</span>
                  </div>
                  {selectedOrder.tableNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Table:</span>
                      <span className="font-medium">{selectedOrder.tableNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Type:</span>
                    <span className="font-medium capitalize">{selectedOrder.orderType}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-green-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['cash', 'card', 'upi', 'online'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${paymentMethod === method
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <CreditCard size={18} />
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBillModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateBill}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Printer size={16} />
                    Generate & Print Bill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Determine what to show based on activeTab
  const showDashboard = location.pathname === '/counter';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {showDashboard && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Counter Dashboard</h2>
              <p className="text-gray-600 mt-2">Welcome to the billing counter</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Collection</p>
                    <p className="text-2xl font-bold text-green-600">₹{stats.todayCollection.toFixed(2)}</p>
                  </div>
                  <IndianRupee className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Bills</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed Bills</p>
                    <p className="text-2xl font-bold text-orange-600">₹{stats.completedCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">₹{stats.totalRevenue.toFixed(2)}</p>
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
                    onClick={() => window.location.href = '/counter/billing'}
                    className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Printer size={20} className="text-orange-600" />
                      <span>Generate New Bill</span>
                    </div>
                    <span className="text-orange-600">→</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/counter/history'}
                    className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-blue-600" />
                      <span>View Bill History</span>
                    </div>
                    <span className="text-blue-600">→</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Total Bills Generated:</span>
                    <span className="font-semibold">{stats.completedCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Pending Bills:</span>
                    <span className="font-semibold text-yellow-600">{stats.pendingCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Today's Collection:</span>
                    <span className="font-semibold text-green-600">₹{stats.todayCollection.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Billing View */}
        {location.pathname === '/counter/billing' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Billing</h2>
              <p className="text-gray-600 mt-1">Generate bills for completed orders</p>
            </div>
            {renderPendingBills()}
          </>
        )}

        {/* History View */}
        {location.pathname === '/counter/history' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Bill History</h2>
              <p className="text-gray-600 mt-1">View all generated bills</p>
            </div>
            {renderCompletedBills()}
          </>
        )}
      </div>

      {/* Bill Modal */}
      {showBillModal && renderBillModal()}
    </div>
  );
};

export default CounterScreen;