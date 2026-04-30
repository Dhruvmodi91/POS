const Order = require("../models/Order");

// Get kitchen orders (confirmed, preparing, ready)
const getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["confirmed", "preparing", "ready"] },
      paymentStatus: { $ne: "cancelled" }
    })
      .populate("items.menuItem", "name price preparationTime")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get kitchen orders error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update order status for kitchen
const updateKitchenStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["confirmed", "preparing", "ready"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status for kitchen. Allowed: confirmed, preparing, ready",
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Validate status transition
    const validTransitions = {
      confirmed: ["preparing"],
      preparing: ["ready"],
      ready: []
    };

    if (validTransitions[order.status] && !validTransitions[order.status].includes(status) && order.status !== status) {
      return res.status(400).json({
        success: false,
        error: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update kitchen status error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getKitchenOrders,
  updateKitchenStatus,
};