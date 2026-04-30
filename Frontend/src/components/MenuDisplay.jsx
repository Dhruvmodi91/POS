import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingCart, X, Trash2 } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

const MenuDisplay = ({ orderType, tableNumber, onBack, onProceedToPayment }) => {
  const { state, dispatch } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState('starter');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Category mapping for display
  const categoryMap = {
    'starter': 'Starters',
    'main': 'Main Courses',
    'dessert': 'Desserts',
    'beverage': 'Beverages',
    'snack': 'Snacks'
  };

  const categories = Object.keys(categoryMap);
  const filteredMenu = state.menu.filter(item => item.category === selectedCategory && item.available);

  const handleAddToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const handleRemoveFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id: itemId } });
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: itemId, quantity } });
  };

  const getItemQuantity = (itemId) => {
    const cartItem = state.cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = state.cart.reduce((count, item) => count + item.quantity, 0);

  // Clear cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch({ type: 'CLEAR_CART' });
    }
  };

  // Proceed to payment - Updated to use callback
  const handleProceedToPayment = () => {
    if (state.cart.length === 0) {
      alert('Your cart is empty. Please add items to proceed.');
      return;
    }
    setIsCartOpen(false);
    // Call the parent callback to open payment modal
    if (onProceedToPayment) {
      onProceedToPayment();
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-red-600 hover:text-red-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="capitalize font-medium">{orderType}</span>
          {orderType === 'dine-in' && tableNumber && (
            <span>• Table {tableNumber}</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Menu</h2>

        {/* Category Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors whitespace-nowrap ${selectedCategory === category
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              {categoryMap[category]}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map(item => {
            const quantity = getItemQuantity(item.id);
            return (
              <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800 text-lg">{item.name}</h4>
                    <span className="text-green-600 font-bold">₹{item.price.toFixed(2)}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {quantity > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, quantity - 1)}
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-medium w-8 text-center">{quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, quantity + 1)}
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <ShoppingCart size={14} />
                        Add to Cart
                      </button>
                    )}
                    {item.isVegetarian && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Veg</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMenu.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items available in this category</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg flex items-center gap-3 transition-all transform hover:scale-105 z-40"
        >
          <ShoppingCart size={24} />
          <div className="text-left">
            <div className="font-medium">{cartItemCount} items</div>
            <div className="text-sm">₹{cartTotal.toFixed(2)}</div>
          </div>
        </button>
      )}

      {/* Cart Off-Canvas Drawer */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Your Cart</h3>
                  <p className="text-sm text-gray-500 mt-1">{cartItemCount} items</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {state.cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.cart.map(item => (
                      <div key={item.id} className="flex gap-4 py-4 border-b">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                              <Plus size={14} />
                            </button>
                            <span className="ml-auto font-semibold text-gray-800">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {state.cart.length > 0 && (
                <div className="border-t p-6">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (5%):</span>
                      <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-green-600">₹{(cartTotal * 1.05).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClearCart}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={handleProceedToPayment}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MenuDisplay;