const express = require("express");
const router = express.Router();
const {
    getWaiterOrders,
    getWaiterTables,
    updateTableStatus,
    markOrderAsServed,
    getWaiterStats,
} = require("../controller/waiterController");
const { protect, waiter } = require("../middleware/auth");

// All waiter routes require authentication and waiter role
router.use(protect);
router.use(waiter);

router.get("/orders", getWaiterOrders);
router.get("/tables", getWaiterTables);
router.get("/stats", getWaiterStats);
router.patch("/tables/:id/status", updateTableStatus);
router.patch("/orders/:id/serve", markOrderAsServed);

module.exports = router;