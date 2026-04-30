const Order = require("../models/Order");
const Bill = require("../models/Bill");
const Menu = require("../models/Menu");
const User = require("../models/User");

// Daily sales report
const getDailySales = async (req, res) => {
  try {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: date },
      status: "completed",
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    res.json({
      success: true,
      data: {
        date: date,
        totalSales,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        orders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Top selling items
const getTopSellingItems = async (req, res) => {
  try {
    const orders = await Order.find({ status: "completed" });

    const itemSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
        }
        itemSales[item.name].quantity += item.quantity;
        itemSales[item.name].revenue += item.price * item.quantity;
      });
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      success: true,
      data: topItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Staff performance
const getStaffPerformance = async (req, res) => {
  try {
    const staff = await User.find({ role: { $ne: "customer" } });

    const performance = await Promise.all(
      staff.map(async (staffMember) => {
        const orders = await Order.find({ createdBy: staffMember._id });
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce(
          (sum, order) => sum + order.total,
          0,
        );

        return {
          name: staffMember.name,
          role: staffMember.role,
          totalOrders,
          totalRevenue,
          lastActive: staffMember.lastLogin,
        };
      }),
    );

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getDailySales,
  getTopSellingItems,
  getStaffPerformance,
};
