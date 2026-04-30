const Menu = require("../models/Menu");

// Get all menu items
const getMenuItems = async (req, res) => {
  try {
    const menu = await Menu.find().sort({ category: 1, name: 1 });
    res.json({
      success: true,
      count: menu.length,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single menu item
const getMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }
    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create menu item (Admin only)
const createMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.create(req.body);
    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Bulk create menu items (Admin only)
const bulkCreateMenuItems = async (req, res) => {
  try {
    const items = req.body;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of menu items",
      });
    }

    // Validate each item has required fields
    const requiredFields = ['name', 'price', 'category'];
    const invalidItems = items.filter(item =>
      !requiredFields.every(field => item[field])
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Some items are missing required fields (name, price, category)",
        invalidItems: invalidItems
      });
    }

    // Insert all items
    const createdItems = await Menu.insertMany(items);

    res.status(201).json({
      success: true,
      message: `Successfully added ${createdItems.length} menu items`,
      count: createdItems.length,
      data: createdItems,
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update menu item (Admin only)
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }
    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete menu item (Admin only)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }
    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  bulkCreateMenuItems,
  updateMenuItem,
  deleteMenuItem,
};