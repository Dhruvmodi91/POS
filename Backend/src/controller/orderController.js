const Order = require("../models/Order");
const Menu = require("../models/Menu");

// Generate order number function
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

  return `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

// Create order
const createOrder = async (req, res) => {
  try {
    const { items, orderType, tableNumber, customer, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Order must have at least one item",
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: `Menu item not found: ${item.menuItem}`,
        });
      }

      if (!menuItem.available) {
        return res.status(400).json({
          success: false,
          error: `${menuItem.name} is currently not available`,
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes || "",
      });
    }

    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order object without orderNumber first to let pre-save hook generate it
    const orderData = {
      items: orderItems,
      subtotal,
      tax,
      total,
      orderType,
      tableNumber: orderType === "dine-in" ? tableNumber : undefined,
      customer: customer || {},
      notes,
      createdBy: req.user?._id,
      status: "pending",
      paymentStatus: "pending",
      orderNumber: orderNumber // Explicitly set orderNumber
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      data: savedOrder,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error(" Create order error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create order",
    });
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const filter = {};

    // If user is customer, only show their orders
    if (req.user.role === "customer") {
      filter["customer.email"] = req.user.email;
    }

    const orders = await Order.find(filter)
      .populate("items.menuItem", "name price")
      .populate("createdBy", "name email")
      .sort("-createdAt");

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get order by ID
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.menuItem", "name price description image")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check authorization: customers can only view their own orders
    if (req.user.role === "customer" && order.customer.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to view this order",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    if (status === "completed") {
      updateData.completedAt = new Date();
    } else if (status === "cancelled") {
      updateData.cancelledAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update order payment
const updateOrderPayment = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updateOrderPayment,
};