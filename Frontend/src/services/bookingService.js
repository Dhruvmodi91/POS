// services/bookingService.js
import { api } from './api';

const BOOKING_ENDPOINTS = {
  CREATE: '/bookings',
  GET_ALL: '/bookings',
  GET_BY_ID: (id) => `/bookings/${id}`,
  UPDATE: (id) => `/bookings/${id}`,
  DELETE: (id) => `/bookings/${id}`,
  UPDATE_STATUS: (id) => `/bookings/${id}/status`,
  GET_BY_PHONE: (phone) => `/bookings/phone/${phone}`,
  GET_BY_TABLE: (tableNumber, date) => 
    `/bookings/table/${tableNumber}${date ? `?date=${date}` : ''}`,
  CHECK_AVAILABILITY: '/bookings/availability',
};

export const bookingService = {
  createBooking: (data) => 
    api.post(BOOKING_ENDPOINTS.CREATE, data),

  getAllBookings: (params) => 
    api.get(BOOKING_ENDPOINTS.GET_ALL, { params }),

  getBookingById: (id) => 
    api.get(BOOKING_ENDPOINTS.GET_BY_ID(id)),

  updateBooking: (id, data) => 
    api.put(BOOKING_ENDPOINTS.UPDATE(id), data),

  updateStatus: (id, status) => 
    api.patch(BOOKING_ENDPOINTS.UPDATE_STATUS(id), { status }),

  deleteBooking: (id) => 
    api.delete(BOOKING_ENDPOINTS.DELETE(id)),

  getBookingsByPhone: (phone) => 
    api.get(BOOKING_ENDPOINTS.GET_BY_PHONE(phone)),

  getBookingsByTable: (tableNumber, date) => 
    api.get(BOOKING_ENDPOINTS.GET_BY_TABLE(tableNumber, date)),

  checkAvailability: (data) => 
    api.post(BOOKING_ENDPOINTS.CHECK_AVAILABILITY, data),
};