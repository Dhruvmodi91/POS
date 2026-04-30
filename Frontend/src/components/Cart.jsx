import React from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import PaymentModal from './PaymentModal';

const Cart = ({ orderType, onBack, onOrderComplete }) => {
  const { state, dispatch } = useRestaurant();
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [orderData, setOrderData] = React.useState(null);

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity === 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: { id: itemId } });
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: itemId, quantity } });
    }
  };

  const handleClearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const handlePlaceOrder = () => {
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tableNumber = orderType === 'dine-in' && state.currentBooking 
      ? state.currentBooking.tableNumber 
      : null;


    const newOrderData = {
      id: Date.now().toString(),
      items: state.cart,
      type: orderType,
      tableNumber,
      total,
      timestamp: new Date().toLocaleTimeString(),
      status: 'received'
    };

    setOrderData(newOrderData);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (paymentResult) => {
    // Create order with payment info
    dispatch({
      type: 'CREATE_ORDER',
      payload: {
        ...orderData,
        payment: paymentResult
      }
    });

    setShowPaymentModal(false);
    onOrderComplete({ ...orderData, payment: paymentResult });
  };
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  if (state.cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
          <button
            onClick={onBack}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-red-600 hover:text-red-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="capitalize font-medium">{orderType}</span>
          {orderType === 'dine-in' && state.currentBooking && (
            <span>• Table {state.currentBooking.tableNumber}</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Order</h2>
          <button
            onClick={handleClearCart}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {state.cart.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg shadow-sm mr-4"
                onError={(e) => {
                  e.target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300';
                }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{item.name}</h4>
                <p className="text-sm text-gray-600">{item.category}</p>
                <p className="font-semibold text-green-600">${item.price.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="text-right min-w-[80px]">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                
                <button
                  onClick={() => handleUpdateQuantity(item.id, 0)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border-t pt-6">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-4 rounded-lg text-lg transition-colors"
          >
            Proceed to Payment - ${total.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={orderData}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default Cart;