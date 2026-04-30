const Order = require("../models/Order");
const Bill = require("../models/Bill");

// Get pending bills (orders with pending payment and not cancelled)
const getPendingBills = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentStatus: "pending",
      status: { $nin: ["cancelled", "completed"] },
    })
      .populate("items.menuItem", "name price")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get pending bills error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Generate bill
const generateBill = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if bill already generated
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        error: "Bill already generated for this order",
      });
    }

    // Generate bill number
    const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const bill = await Bill.create({
      billNumber,
      order: order._id,
      customer: order.customer,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount || 0,
      total: order.total,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: "paid",
      generatedBy: req.user._id,
    });

    // Update order payment status
    order.paymentStatus = "paid";
    order.paymentMethod = req.body.paymentMethod;
    await order.save();

    res.status(201).json({
      success: true,
      data: bill,
      message: "Bill generated successfully",
    });
  } catch (error) {
    console.error("Generate bill error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all bills
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("order", "orderNumber orderType tableNumber")
      .populate("generatedBy", "name email")
      .sort("-createdAt");

    res.json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getPendingBills,
  generateBill,
  getBills,
};