const Table = require("../models/Table");

// Get all tables
const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort("tableNumber");
    res.json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single table
const getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
      });
    }
    res.json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create table (Admin only)
const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update table
const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
      });
    }
    res.json({
      success: true,
      data: table,
    });
  } catch (error) {
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
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
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
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete table (Admin only)
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        error: "Table not found",
      });
    }
    res.json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getTables,
  getTable,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
};
