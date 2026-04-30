const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["raw", "packaged", "beverage", "cleaning"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "l", "ml", "pcs", "box"],
    },
    minQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: String,
    expiryDate: Date,
    lastRestocked: Date,
    status: {
      type: String,
      enum: ["in-stock", "low-stock", "out-of-stock"],
      default: "in-stock",
    },
  },
  {
    timestamps: true,
  },
);

// Update status based on quantity
inventorySchema.pre("save", function (next) {
  if (this.quantity <= 0) {
    this.status = "out-of-stock";
  } else if (this.quantity <= this.minQuantity) {
    this.status = "low-stock";
  } else {
    this.status = "in-stock";
  }
  next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
