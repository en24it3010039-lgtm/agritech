
const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    scientificName: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      default: "General"
    },
    season: {
      type: String,
      enum: ["Kharif", "Rabi", "Zaid", "All Season"],
      default: "All Season"
    },
    soilType: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);
