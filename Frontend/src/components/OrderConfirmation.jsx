import React from 'react';
import { CheckCircle, Clock, MapPin, ShoppingBag, Printer, Home } from 'lucide-react';

const OrderConfirmation = ({ orderData, onClose }) => {
  const getOrderIcon = (type) => {
    switch (type) {
      case 'dine-in':
        return <ShoppingBag className="h-8 w-8 text-green-600" />;
      case 'takeaway':
        return <ShoppingBag className="h-8 w-8 text-amber-600" />;
      case 'delivery':
        return <MapPin className="h-8 w-8 text-blue-600" />;
      default:
        return <ShoppingBag className="h-8 w-8 text-gray-600" />;
    }
  };

  const getEstimatedTime = (type) => {
    switch (type) {
      case 'takeaway':
        return '15-30 minutes';
      case 'delivery':
        return '30-45 minutes';
      case 'dine-in':
        return '20-35 minutes';
      default:
        return '25-40 minutes';
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div id="receipt-content" className="bg-white rounded-xl shadow-lg p-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600">Thank you for your order. We'll prepare it with care.</p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getOrderIcon(orderData.orderType)}
              <div>
                <h3 className="font-semibold text-gray-800 capitalize">{orderData.orderType} Order</h3>
                <p className="text-sm text-gray-600">Order ID: #{orderData.orderNumber || orderData.id}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">₹{orderData.total.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{new Date(orderData.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {orderData.tableNumber && (
            <div className="flex items-center gap-2 mb-4 text-sm">
              <ShoppingBag size={16} className="text-gray-600" />
              <span className="text-gray-600">Table Number: <strong>{orderData.tableNumber}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-gray-600" />
            <span className="text-gray-600">Estimated time: <strong>{getEstimatedTime(orderData.orderType)}</strong></span>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
          <div className="space-y-2">
            {orderData.items && orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-semibold text-gray-800">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₹{orderData.subtotal?.toFixed(2) || orderData.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (5%):</span>
              <span>₹{orderData.tax?.toFixed(2) || (orderData.total * 0.05).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total:</span>
              <span>₹{orderData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-800 mb-4">Order Status</h4>
          <div className="flex items-center">
            <div className="flex items-center text-green-600">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span className="ml-2 text-sm font-medium">Order Received</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              <span className="ml-2 text-sm">Preparing</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              <span className="ml-2 text-sm">Ready</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Place Another Order
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> You'll receive notifications about your order status.
            {orderData.orderType === 'delivery' && ' Please ensure someone is available to receive the delivery.'}
            {orderData.orderType === 'takeaway' && ' Please arrive within the estimated time for pickup.'}
            {orderData.orderType === 'dine-in' && ' Your food will be served to your table when ready.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;