// services/tableService.js
import { api } from './api';

const TABLE_ENDPOINTS = {
  CREATE: '/tables',
  GET_ALL: '/tables',
  GET_BY_ID: (id) => `/tables/${id}`,
  UPDATE: (id) => `/tables/${id}`,
  DELETE: (id) => `/tables/${id}`,
  UPDATE_STATUS: (id) => `/tables/${id}/status`,
  GET_AVAILABLE: '/tables/available',
  GET_BY_LOCATION: (location) => `/tables/location/${location}`,
  ASSIGN_ORDER: (tableId, orderId) => 
    `/tables/${tableId}/assign-order/${orderId}`,
  CLEAR_TABLE: (tableId) => `/tables/${tableId}/clear`,
};

export const tableService = {
  createTable: (data) => 
    api.post(TABLE_ENDPOINTS.CREATE, data),

  getAllTables: (params) => 
    api.get(TABLE_ENDPOINTS.GET_ALL, { params }),

  getTableById: (id) => 
    api.get(TABLE_ENDPOINTS.GET_BY_ID(id)),

  updateTable: (id, data) => 
    api.put(TABLE_ENDPOINTS.UPDATE(id), data),

  deleteTable: (id) => 
    api.delete(TABLE_ENDPOINTS.DELETE(id)),

  updateStatus: (id, status) => 
    api.patch(TABLE_ENDPOINTS.UPDATE_STATUS(id), { status }),

  getAvailableTables: (partySize) => 
    api.get(TABLE_ENDPOINTS.GET_AVAILABLE, { params: { partySize } }),

  getTablesByLocation: (location) => 
    api.get(TABLE_ENDPOINTS.GET_BY_LOCATION(location)),

  assignOrder: (tableId, orderId) => 
    api.patch(TABLE_ENDPOINTS.ASSIGN_ORDER(tableId, orderId)),

  clearTable: (tableId) => 
    api.patch(TABLE_ENDPOINTS.CLEAR_TABLE(tableId)),
};