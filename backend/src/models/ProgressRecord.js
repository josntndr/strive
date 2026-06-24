const mongoose = require("mongoose");

const progressRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weight: Number,
    waistMeasurement: {
      type: Number,
      alias: "waist",
    },
    hipMeasurement: {
      type: Number,
      alias: "hips",
    },
    notes: {
      type: String,
      default: "",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ProgressRecord || mongoose.model("ProgressRecord", progressRecordSchema);
