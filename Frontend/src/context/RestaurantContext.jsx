import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const RestaurantContext = createContext();

const API_URL = 'https://pos-co0q.onrender.com/api';

// Load cart from localStorage
const loadCartFromStorage = () => {
  const savedCart = localStorage.getItem('restaurant_cart');
  return savedCart ? JSON.parse(savedCart) : [];
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  localStorage.setItem('restaurant_cart', JSON.stringify(cart));
};

const initialState = {
  menu: [],
  cart: loadCartFromStorage(),
  orders: [],
  currentOrder: null,
  currentBooking: null,
  loading: false,
  error: null,
};

const restaurantReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case 'SET_MENU':
      return { ...state, menu: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        newState = {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        newState = {
          ...state,
          cart: [...state.cart, { ...action.payload, quantity: 1 }],
        };
      }
      saveCartToStorage(newState.cart);
      return newState;

    case 'REMOVE_FROM_CART':
      newState = {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload.id),
      };
      saveCartToStorage(newState.cart);
      return newState;

    case 'UPDATE_CART_QUANTITY':
      if (action.payload.quantity <= 0) {
        newState = {
          ...state,
          cart: state.cart.filter(item => item.id !== action.payload.id),
        };
      } else {
        newState = {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          ),
        };
      }
      saveCartToStorage(newState.cart);
      return newState;

    case 'CLEAR_CART':
      newState = { ...state, cart: [] };
      saveCartToStorage(newState.cart);
      return newState;

    case 'SET_CURRENT_ORDER':
      return { ...state, currentOrder: action.payload };
    case 'SET_CURRENT_BOOKING':
      return { ...state, currentBooking: action.payload };
    default:
      return state;
  }
};

export const RestaurantProvider = ({ children }) => {
  const [state, dispatch] = useReducer(restaurantReducer, initialState);

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, []);

  const fetchMenu = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.get(`${API_URL}/menu`);
      if (response.data.success) {
        const formattedMenu = response.data.data.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description,
          image: item.image,
          available: item.available,
          isVegetarian: item.isVegetarian,
          preparationTime: item.preparationTime
        }));
        dispatch({ type: 'SET_MENU', payload: formattedMenu });
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        dispatch({ type: 'SET_ORDERS', payload: response.data.data });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const createOrder = async (orderData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/orders`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        dispatch({ type: 'SET_CURRENT_ORDER', payload: response.data.data });
        dispatch({ type: 'CLEAR_CART' });
        await fetchOrders();
        return { success: true, order: response.data.data };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create order'
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateOrderPayment = async (orderId, paymentData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/payment`,
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchOrders();
        return { success: true, order: response.data.data };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update payment'
      };
    }
  };

  const getOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        return { success: true, order: response.data.data };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch order'
      };
    }
  };

  const value = {
    state,
    dispatch,
    fetchMenu,
    fetchOrders,
    createOrder,
    updateOrderPayment,
    getOrder,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};