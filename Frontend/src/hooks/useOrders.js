// hooks/useOrders.js
import { useState, useCallback, useEffect } from 'react';
import { orderService } from '../services/orderService';

export const useOrders = (autoFetch = false) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAllOrders(params);
      if (response.success && response.data) {
        setOrders(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrder(data);
      if (response.success && response.data) {
        setOrders(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch, fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder: orderService.updateOrder,
    updateStatus: orderService.updateStatus,
    deleteOrder: orderService.deleteOrder,
  };
};