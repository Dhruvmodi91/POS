const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "maintenance"],
      default: "available",
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    section: {
      type: String,
      enum: ["indoor", "outdoor", "private", "balcony"],
      default: "indoor",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    qrCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Table", tableSchema);