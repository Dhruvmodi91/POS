
// Menu Item structure
export const MenuItem = {
  id: '',
  name: '',
  image: undefined,
  price: 0,
  category: '',
  available: true,
};

// Cart Item extends MenuItem
export const CartItem = {
  ...MenuItem,
  quantity: 0,
};

// Order structure
export const Order = {
  id: '',
  items: [],
  type: 'dine-in',
  tableNumber: undefined,
  total: 0,
  date: '',
  timestamp: '',
  status: 'received',
  payment: undefined,
};

// Payment Info structure
export const PaymentInfo = {
  method: 'cod',
  status: '',
  transactionId: '',
  amount: 0,
  timestamp: '',
  metadata: undefined,
};

// Table structure
export const Table = {
  id: '',
  number: '',
  status: 'available',
};

// Booking structure
export const Booking = {
  id: '',
  tableNumber: '',
  timeSlot: '',
  timestamp: '',
  status: '',
  preOrder: null,
};

// User structure
export const User = {
  id: undefined,
  name: '',
  email: '',
  role: 'customer',
  token: undefined,
};

// Restaurant State structure
export const RestaurantState = {
  menu: [],
  cart: [],
  orders: [],
  tables: [],
  currentBooking: null,
};

// Form Data structure
export const FormData = {
  name: '',
  image: '',
  price: '',
  category: '',
  available: true,
};

// Component Props
// Note: In JavaScript, these are just reference objects for documentation

export const PaymentModalProps = {
  isOpen: false,
  onClose: () => {},
  orderData: null,
  onPaymentComplete: (paymentResult) => {},
};

export const CartProps = {
  orderType: 'dine-in',
  onBack: () => {},
  onOrderComplete: (order) => {},
};

export const OrderConfirmationProps = {
  orderData: null,
  onClose: () => {},
};

export const TableBookingProps = {
  onComplete: () => {},
  onBack: () => {},
};

export const MenuDisplayProps = {
  orderType: 'dine-in',
  onShowCart: () => {},
  onBack: () => {},
};

// Helper functions to create objects with default values
export const createMenuItem = (overrides = {}) => ({
  id: '',
  name: '',
  image: undefined,
  price: 0,
  category: '',
  available: true,
  ...overrides,
});

export const createCartItem = (overrides = {}) => ({
  id: '',
  name: '',
  image: undefined,
  price: 0,
  category: '',
  available: true,
  quantity: 0,
  ...overrides,
});

export const createOrder = (overrides = {}) => ({
  id: '',
  items: [],
  type: 'dine-in',
  tableNumber: undefined,
  total: 0,
  date: '',
  timestamp: '',
  status: 'received',
  payment: undefined,
  ...overrides,
});

export const createPaymentInfo = (overrides = {}) => ({
  method: 'cod',
  status: '',
  transactionId: '',
  amount: 0,
  timestamp: '',
  metadata: undefined,
  ...overrides,
});

export const createTable = (overrides = {}) => ({
  id: '',
  number: '',
  status: 'available',
  ...overrides,
});

export const createBooking = (overrides = {}) => ({
  id: '',
  tableNumber: '',
  timeSlot: '',
  timestamp: '',
  status: '',
  preOrder: null,
  ...overrides,
});

export const createUser = (overrides = {}) => ({
  id: undefined,
  name: '',
  email: '',
  role: 'customer',
  token: undefined,
  ...overrides,
});

export const createRestaurantState = (overrides = {}) => ({
  menu: [],
  cart: [],
  orders: [],
  tables: [],
  currentBooking: null,
  ...overrides,
});

export const createFormData = (overrides = {}) => ({
  name: '',
  image: '',
  price: '',
  category: '',
  available: true,
  ...overrides,
});