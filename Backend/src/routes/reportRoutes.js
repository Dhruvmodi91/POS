const express = require("express");
const router = express.Router();
const {
  getDailySales,
  getTopSellingItems,
  getStaffPerformance,
} = require("../controller/reportController");
const { protect, admin } = require("../middleware/auth");

// All report routes require admin access
router.use(protect);
router.use(admin);

router.get("/daily-sales", getDailySales);
router.get("/top-items", getTopSellingItems);
router.get("/staff-performance", getStaffPerformance);

module.exports = router;
