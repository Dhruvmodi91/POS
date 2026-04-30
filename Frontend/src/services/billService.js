// services/billService.js
import { api } from './api';

const BILL_ENDPOINTS = {
  CREATE: '/bills',
  GET_ALL: '/bills',
  GET_BY_ID: (id) => `/bills/${id}`,
  GET_BY_ORDER: (orderId) => `/bills/order/${orderId}`,
  UPDATE: (id) => `/bills/${id}`,
  DELETE: (id) => `/bills/${id}`,
  UPDATE_STATUS: (id) => `/bills/${id}/status`,
  MARK_PRINTED: (id) => `/bills/${id}/print`,
  GET_STATS: '/bills/stats/daily',
  SEARCH: '/bills/search',
  EXPORT: '/bills/export',
  PRINT: (id) => `/bills/${id}/print/pdf`,
};

export const billService = {
  createBill: (data) => 
    api.post(BILL_ENDPOINTS.CREATE, data),

  getAllBills: (params) => 
    api.get(BILL_ENDPOINTS.GET_ALL, { params }),

  getBillById: (id) => 
    api.get(BILL_ENDPOINTS.GET_BY_ID(id)),

  getBillByOrder: (orderId) => 
    api.get(BILL_ENDPOINTS.GET_BY_ORDER(orderId)),

  updateBill: (id, data) => 
    api.put(BILL_ENDPOINTS.UPDATE(id), data),

  updatePaymentStatus: (id, status) => 
    api.patch(BILL_ENDPOINTS.UPDATE_STATUS(id), { status }),

  markAsPrinted: (id) => 
    api.patch(BILL_ENDPOINTS.MARK_PRINTED(id)),

  deleteBill: (id) => 
    api.delete(BILL_ENDPOINTS.DELETE(id)),

  searchBills: (query, filters = {}) => 
    api.get(BILL_ENDPOINTS.SEARCH, { params: { q: query, ...filters } }),

  getDailyStats: (date) => 
    api.get(BILL_ENDPOINTS.GET_STATS, { params: { date } }),

  exportBills: (params) => 
    api.get(BILL_ENDPOINTS.EXPORT, { params, responseType: 'blob' }),

  printBill: (id) => 
    api.get(BILL_ENDPOINTS.PRINT(id), { responseType: 'blob' }),
};