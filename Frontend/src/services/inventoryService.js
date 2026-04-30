// services/inventoryService.js
import { api } from './api';

const INVENTORY_ENDPOINTS = {
  CREATE: '/inventory',
  GET_ALL: '/inventory',
  GET_BY_ID: (id) => `/inventory/${id}`,
  UPDATE: (id) => `/inventory/${id}`,
  DELETE: (id) => `/inventory/${id}`,
  RESTOCK: (id) => `/inventory/${id}/restock`,
  LOW_STOCK: '/inventory/low-stock',
  BY_CATEGORY: '/inventory/category',
  UPDATE_STOCK: (id) => `/inventory/${id}/stock`,
};

export const inventoryService = {
  createItem: (data) => 
    api.post(INVENTORY_ENDPOINTS.CREATE, data),

  getAllItems: (params) => 
    api.get(INVENTORY_ENDPOINTS.GET_ALL, { params }),

  getItemById: (id) => 
    api.get(INVENTORY_ENDPOINTS.GET_BY_ID(id)),

  updateItem: (id, data) => 
    api.put(INVENTORY_ENDPOINTS.UPDATE(id), data),

  deleteItem: (id) => 
    api.delete(INVENTORY_ENDPOINTS.DELETE(id)),

  restockItem: (id, quantity) => 
    api.patch(INVENTORY_ENDPOINTS.RESTOCK(id), { quantity }),

  getLowStockItems: () => 
    api.get(INVENTORY_ENDPOINTS.LOW_STOCK),

  getByCategory: (category) => 
    api.get(`${INVENTORY_ENDPOINTS.BY_CATEGORY}/${category}`),

  updateStock: (id, quantity, action) => 
    api.patch(INVENTORY_ENDPOINTS.UPDATE_STOCK(id), { quantity, action }),
};