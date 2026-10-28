
const Booking = require("../db/user/bookingmodel");
const Product = require("../db/user/productmodel");

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Provide a valid product ID and quantity"
      });
    }

    const selectedProduct = await Product.findById(product);

    if (!selectedProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (selectedProduct.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient product stock"
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      product: selectedProduct._id,
      quantity,
      totalPrice: selectedProduct.price * quantity
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for the logged-in user
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("product", "name price category");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get one booking
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate("product", "name price category");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel a pending booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled"
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
