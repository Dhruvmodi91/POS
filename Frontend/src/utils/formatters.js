// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-IN');
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return d.toISOString();
};

// Format order status
export const formatOrderStatus = (status) => {
  const statusMap = {
    PENDING: 'Pending',
    RECEIVED: 'Received',
    PREPARING: 'Preparing',
    READY: 'Ready to Serve',
    SERVED: 'Served',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
    DELIVERED: 'Delivered',
  };
  return statusMap[status] || status;
};

// Format payment status
export const formatPaymentStatus = (status) => {
  const statusMap = {
    PENDING: 'Pending',
    PAID: 'Paid',
    PARTIAL: 'Partial Payment',
    REFUNDED: 'Refunded',
  };
  return statusMap[status] || status;
};

// Calculate order total
export const calculateOrderTotal = (items, taxRate = 10, serviceCharge = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount + serviceCharge - discount;
  return {
    subtotal,
    taxAmount,
    total,
  };
};

// Generate bill items from order
export const generateBillItems = (orderItems) => {
  return orderItems.map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }));
};