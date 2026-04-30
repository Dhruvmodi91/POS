const express = require("express");
const router = express.Router();
const {
  getKitchenOrders,
  updateKitchenStatus,
} = require("../controller/kitchencontroller");
const { protect, kitchen } = require("../middleware/auth");

// Kitchen routes (require kitchen or admin role)
router.use(protect);
router.use(kitchen);

router.get("/orders", getKitchenOrders);
router.patch("/orders/:id/status", updateKitchenStatus);

module.exports = router;