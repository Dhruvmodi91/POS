// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  ORDERS: {
    BASE: '/api/orders',
    BY_ID: (id) => `/api/orders/${id}`,
    STATUS: (id) => `/api/orders/${id}/status`,
    TODAY: '/api/orders/today',
  },
  MENU: {
    BASE: '/api/menu',
    BY_ID: (id) => `/api/menu/${id}`,
    CATEGORY: (category) => `/api/menu/category/${category}`,
  },
  INVENTORY: {
    BASE: '/api/inventory',
    BY_ID: (id) => `/api/inventory/${id}`,
    LOW_STOCK: '/api/inventory/low-stock',
  },
  BOOKINGS: {
    BASE: '/api/bookings',
    BY_ID: (id) => `/api/bookings/${id}`,
    TODAY: '/api/bookings/today',
  },
  BILLS: {
    BASE: '/api/bills',
    BY_ID: (id) => `/api/bills/${id}`,
    ORDER: (orderId) => `/api/bills/order/${orderId}`,
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  WAITER: 'waiter',
  KITCHEN: 'kitchen',
  COUNTER: 'counter',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  RECEIVED: 'RECEIVED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  DELIVERED: 'DELIVERED',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  REFUNDED: 'REFUNDED',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  UPI: 'UPI',
  ONLINE: 'ONLINE',
};

// Order Types
export const ORDER_TYPES = {
  DINE_IN: 'DINE_IN',
  TAKEAWAY: 'TAKEAWAY',
  DELIVERY: 'DELIVERY',
};

// Menu Categories
export const MENU_CATEGORIES = {
  STARTERS: 'Starters',
  MAIN_COURSE: 'Main Course',
  SOUPS: 'Soups',
  SALADS: 'Salads',
  BREADS: 'Breads',
  RICE: 'Rice',
  BEVERAGES: 'Beverages',
  DESSERTS: 'Desserts',
};

// Inventory Categories
export const INVENTORY_CATEGORIES = {
  VEGETABLE: 'vegetable',
  MEAT: 'meat',
  DAIRY: 'dairy',
  BEVERAGE: 'beverage',
  SPICE: 'spice',
  PACKAGED: 'packaged',
  OTHER: 'other',
};

// Inventory Units
export const INVENTORY_UNITS = {
  KG: 'kg',
  G: 'g',
  LITER: 'liter',
  ML: 'ml',
  PIECE: 'piece',
  PACKET: 'packet',
  DOZEN: 'dozen',
};

// Table Status
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  CART: 'cart',
};

// Time Slots for Bookings
export const TIME_SLOTS = [
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
];

// Tax Rates
export const TAX_RATES = {
  GST: 10,
  SERVICE_CHARGE: 5,
};

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 10,
  CURRENCY: 'INR',
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  ORDER_CREATED: 'Order created successfully!',
  ORDER_UPDATED: 'Order updated successfully!',
  BOOKING_CREATED: 'Booking created successfully!',
  BOOKING_UPDATED: 'Booking updated successfully!',
  INVENTORY_UPDATED: 'Inventory updated successfully!',
  BILL_GENERATED: 'Bill generated successfully!',
};

// Theme Modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};