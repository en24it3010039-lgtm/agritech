
const express = require("express");
const router = express.Router();

const userRoutes = require("./user");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm
} = require("../controllers/farmcontroller");

const {
  createCrop,
  getCrops,
  getCropById,
  updateCrop,
  deleteCrop
} = require("../controllers/cropcontroller");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/productcontroller");

const {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
} = require("../controllers/bookingcontroller");

// API health check
router.get("/", (req, res) => {
  res.json({ message: "AgriTech API is running" });
});

// User authentication
router.use("/users", userRoutes);

// Protected authentication test
router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route successfully",
    user: req.user
  });
});

// Farm management
router.post("/farms", authMiddleware, createFarm);
router.get("/farms", authMiddleware, getFarms);
router.get("/farms/:id", authMiddleware, getFarmById);
router.put("/farms/:id", authMiddleware, updateFarm);
router.delete("/farms/:id", authMiddleware, deleteFarm);

// Crop management
router.post("/crops", authMiddleware, createCrop);
router.get("/crops", authMiddleware, getCrops);
router.get("/crops/:id", authMiddleware, getCropById);
router.put("/crops/:id", authMiddleware, updateCrop);
router.delete("/crops/:id", authMiddleware, deleteCrop);

// Product management
router.post("/products", authMiddleware, createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", authMiddleware, updateProduct);
router.delete("/products/:id", authMiddleware, deleteProduct);

// Booking management
router.post("/bookings", authMiddleware, createBooking);
router.get("/bookings", authMiddleware, getBookings);
router.get("/bookings/:id", authMiddleware, getBookingById);
router.patch("/bookings/:id/cancel", authMiddleware, cancelBooking);

module.exports = router;
