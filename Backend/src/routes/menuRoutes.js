const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  bulkCreateMenuItems,
  updateMenuItem,
  deleteMenuItem,
} = require("../controller/menuController");
const { protect, admin } = require("../middleware/auth");

// Public routes (anyone can view menu)
router.get("/", getMenuItems);
router.get("/:id", getMenuItem);

// Admin only routes
router.post("/", protect, admin, createMenuItem);
router.post("/bulk", protect, admin, bulkCreateMenuItems); // ← New bulk route
router.put("/:id", protect, admin, updateMenuItem);
router.delete("/:id", protect, admin, deleteMenuItem);

module.exports = router;