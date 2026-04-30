const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["starter", "main", "dessert", "beverage", "snack"],
    },
    image: {
      type: String,
      default: null,
    },
    available: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 15,
      min: 5,
    },
    calories: {
      type: Number,
      default: 0,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Menu", menuSchema);
