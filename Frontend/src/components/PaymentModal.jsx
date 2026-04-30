import React, { useState } from 'react';
import { CreditCard, Truck, X, Check, Loader } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const { updateOrderPayment } = useRestaurant();

  if (!isOpen) return null;

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paymentResult = {
        method: paymentMethod,
        status: 'completed',
        transactionId: `TXN${Date.now()}`,
        amount: orderData.total,
        timestamp: new Date().toISOString()
      };

      // Only update payment if we have a real order ID (not 'temp')
      if (orderData.id && orderData.id !== 'temp') {
        const updateResult = await updateOrderPayment(orderData.id, {
          paymentStatus: 'paid',
          paymentMethod: paymentMethod === 'cod' ? 'cash' : paymentMethod
        });

        if (!updateResult.success) {
          alert('Payment update failed. Please contact support.');
          onClose();
          setIsProcessing(false);
          return;
        }
      }

      onPaymentComplete(paymentResult);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Payment</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span>{orderData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total:</span>
                <span className="text-green-600">₹{orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-4">Payment Method</h4>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                  {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <Truck className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-800">Cash </div>
                  <div className="text-sm text-gray-600">Pay when your order arrives</div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                  {paymentMethod === 'online' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-800">Online Payment</div>
                  <div className="text-sm text-gray-600">Pay securely with card</div>
                </div>
              </label>
            </div>
          </div>

          {paymentMethod === 'online' && (
            <div className="mb-6 space-y-4">
              <h4 className="font-semibold text-gray-800">Card Details</h4>
              <div>
                <input
                  type="text"
                  value={cardDetails.cardholderName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Cardholder Name"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={cardDetails.expiryDate}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: formatExpiryDate(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="MM/YY"
                  maxLength="5"
                />
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="CVV"
                  maxLength="4"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || (paymentMethod === 'online' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName))}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Processing...
                </>
              ) : (
                <>
                  <Check size={16} />
                  {paymentMethod === 'cod' ? 'Confirm Order' : `Pay $${orderData.total.toFixed(2)}`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;