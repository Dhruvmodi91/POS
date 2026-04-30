const express = require("express");
const router = express.Router();
const {
  getPendingBills,
  generateBill,
  getBills,
} = require("../controller/counterController");
const { protect, counter } = require("../middleware/auth");

// Counter routes (require counter or admin role)
router.use(protect);
router.use(counter);

router.get("/pending", getPendingBills);
router.post("/orders/:id/bill", generateBill);
router.get("/bills", getBills);

module.exports = router;