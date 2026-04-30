import api from './api';

// Get all menu items
export const getAll = async (params) => {
  const response = await api.get('/menu', { params });
  return response.data;
};

// Get single menu item
export const getById = async (id) => {
  const response = await api.get(`/menu/${id}`);
  return response.data;
};

// Create menu item
export const create = async (data) => {
  const response = await api.post('/menu', data);
  return response.data;
};

// Update menu item
export const update = async (id, data) => {
  const response = await api.put(`/menu/${id}`, data);
  return response.data;
};

// Delete menu item
export const deleteItem = async (id) => {
  await api.delete(`/menu/${id}`);
};

// Search menu items
export const search = async (query) => {
  const response = await api.get('/menu', {
    params: { search: query }
  });
  return response.data;
};

// Export all functions
export const menuService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteItem,
  search
};