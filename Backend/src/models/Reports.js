const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["sales", "inventory", "staff", "customer", "daily"],
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    format: {
      type: String,
      enum: ["json", "pdf", "excel"],
      default: "json",
    },
    fileUrl: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Report", reportSchema);
