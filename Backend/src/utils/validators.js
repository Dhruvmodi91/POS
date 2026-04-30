const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateOrder = (order) => {
  const errors = [];

  if (!order.items || order.items.length === 0) {
    errors.push("At least one item is required");
  }

  if (!order.orderType) {
    errors.push("Order type is required");
  }

  if (order.orderType === "dine-in" && !order.tableNumber) {
    errors.push("Table number is required for dine-in orders");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateOrder,
};
