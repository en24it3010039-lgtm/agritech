const Farm = require("../db/user/farmmodel");

// Create a new farm
const createFarm = async (req, res) => {
  try {
    const { farmName, location, area, areaUnit, soilType, crops } = req.body;

    if (!farmName || !location || area === undefined || area === null) {
      return res.status(400).json({
        message: "Farm name, location, and area are required"
      });
    }

    const farm = await Farm.create({
      farmer: req.user.id,
      farmName,
      location,
      area,
      areaUnit,
      soilType,
      crops
    });

    return res.status(201).json({
      message: "Farm created successfully",
      farm
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create farm",
      error: error.message
    });
  }
};

// Get all farms belonging to the logged-in farmer
const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({
      farmer: req.user.id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: farms.length,
      farms
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve farms",
      error: error.message
    });
  }
};

// Get one farm belonging to the logged-in farmer
const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found"
      });
    }

    return res.status(200).json({ farm });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid farm ID"
      });
    }

    return res.status(500).json({
      message: "Failed to retrieve farm",
      error: error.message
    });
  }
};

// Update one farm belonging to the logged-in farmer
const updateFarm = async (req, res) => {
  try {
    const allowedFields = [
      "farmName",
      "location",
      "area",
      "areaUnit",
      "soilType",
      "crops"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update"
      });
    }

    const farm = await Farm.findOneAndUpdate(
      {
        _id: req.params.id,
        farmer: req.user.id
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found"
      });
    }

    return res.status(200).json({
      message: "Farm updated successfully",
      farm
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid farm ID"
      });
    }

    return res.status(500).json({
      message: "Failed to update farm",
      error: error.message
    });
  }
};

// Delete one farm belonging to the logged-in farmer
const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!farm) {
      return res.status(404).json({
        message: "Farm not found"
      });
    }

    return res.status(200).json({
      message: "Farm deleted successfully"
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid farm ID"
      });
    }

    return res.status(500).json({
      message: "Failed to delete farm",
      error: error.message
    });
  }
};

module.exports = {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm
};