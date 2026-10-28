const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    farmName: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    area: {
      type: Number,
      required: true,
      min: 0
    },
    areaUnit: {
      type: String,
      enum: ["acre", "hectare"],
      default: "acre"
    },
    soilType: {
      type: String,
      trim: true,
      default: "Unknown"
    },
    crops: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Farm", farmSchema);