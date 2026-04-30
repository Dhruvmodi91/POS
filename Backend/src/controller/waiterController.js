const Order = require("../models/Order");
const Table = require("../models/Table");

// Get waiter orders (active orders)
const getWaiterOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            status: { $in: ["confirmed", "preparing", "ready", "served"] },
            paymentStatus: { $ne: "cancelled" }
        })
            .populate("items.menuItem", "name price image")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error("Get waiter orders error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Get all tables for waiter
const getWaiterTables = async (req, res) => {
    try {
        const tables = await Table.find({ isActive: true })
            .populate("currentOrder", "orderNumber total status")
            .sort("tableNumber");

        res.json({
            success: true,
            count: tables.length,
            data: tables,
        });
    } catch (error) {
        console.error("Get waiter tables error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Update table status
const updateTableStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["available", "occupied", "reserved", "maintenance"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: "Invalid status. Allowed: available, occupied, reserved, maintenance",
            });
        }

        const table = await Table.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                error: "Table not found",
            });
        }

        res.json({
            success: true,
            data: table,
            message: `Table ${table.tableNumber} status updated to ${status}`,
        });
    } catch (error) {
        console.error("Update table status error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Mark order as served
const markOrderAsServed = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: "Order not found",
            });
        }

        if (order.status !== "ready") {
            return res.status(400).json({
                success: false,
                error: "Only orders that are ready can be marked as served",
            });
        }

        order.status = "served";
        await order.save();

        // If it's a dine-in order, update table status
        if (order.orderType === "dine-in" && order.tableNumber) {
            const table = await Table.findOne({ tableNumber: order.tableNumber });
            if (table && table.status === "occupied") {
                table.status = "available";
                await table.save();
            }
        }

        res.json({
            success: true,
            data: order,
            message: "Order marked as served",
        });
    } catch (error) {
        console.error("Mark order served error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Get waiter statistics
const getWaiterStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeOrders = await Order.countDocuments({
            status: { $in: ["confirmed", "preparing", "ready"] },
        });

        const occupiedTables = await Table.countDocuments({ status: "occupied" });
        const availableTables = await Table.countDocuments({ status: "available" });

        const todayOrders = await Order.find({
            createdAt: { $gte: today },
            status: { $in: ["served", "completed"] }
        });

        const totalToday = todayOrders.reduce((sum, order) => sum + order.total, 0);

        res.json({
            success: true,
            data: {
                activeOrders,
                occupiedTables,
                availableTables,
                totalToday,
                totalTables: await Table.countDocuments()
            },
        });
    } catch (error) {
        console.error("Get waiter stats error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

module.exports = {
    getWaiterOrders,
    getWaiterTables,
    updateTableStatus,
    markOrderAsServed,
    getWaiterStats,
};