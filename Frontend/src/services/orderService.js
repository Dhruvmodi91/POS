import api from './api';

// Get all orders
export const getAll = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// Create order
export const create = async (data) => {
  const response = await api.post('/orders', data);
  return response.data;
};

// Update order status
export const updateStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};

// Get order by ID
export const getById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Export all functions
export const orderService = {
  getAll,
  getById,
  create,
  updateStatus
};