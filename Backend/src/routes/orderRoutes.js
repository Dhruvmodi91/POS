const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updateOrderPayment,
} = require("../controller/orderController");
const { protect } = require("../middleware/auth");

// All order routes are protected
router.use(protect);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/payment", updateOrderPayment);

module.exports = router;
