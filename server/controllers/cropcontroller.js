
const Crop = require("../db/user/cropmodel");

// Create a crop
const createCrop = async (req, res) => {
  try {
    const crop = await Crop.create({
      ...req.body,
      farmer: req.user.id
    });

    res.status(201).json({
      message: "Crop created successfully",
      crop
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all crops belonging to the logged-in farmer
const getCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user.id });

    res.status(200).json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one crop
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.status(200).json(crop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a crop
const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.status(200).json({
      message: "Crop updated successfully",
      crop
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a crop
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.status(200).json({ message: "Crop deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCrop,
  getCrops,
  getCropById,
  updateCrop,
  deleteCrop
};
