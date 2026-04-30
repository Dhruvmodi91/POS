const express = require("express");
const router = express.Router();
const {
  getTables,
  getTable,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
} = require("../controller/tableController");
const { protect, admin } = require("../middleware/auth");

// Public routes (view tables)
router.get("/", getTables);
router.get("/:id", getTable);

// Protected routes
router.post("/", protect, admin, createTable);
router.put("/:id", protect, admin, updateTable);
router.patch("/:id/status", protect, updateTableStatus);
router.delete("/:id", protect, admin, deleteTable);

module.exports = router;
