const Driver = require('../model/driverModel');
const UserOrder = require("../model/userOrder");
const DeliveryAssignment = require("../model/deliveryModel");

// Create a new driver
exports.createDriver = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a driver
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a driver
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.acceptOrder = async (req, res) => {
  const { orderId, driverName, deliveryAddress, restaurantAddress } = req.body;
  console.log(orderId);
  // Validate required fields
  if (!orderId || !driverName || !deliveryAddress || !restaurantAddress) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 1) Find the order and update its deliveryStatus
    const order = await UserOrder.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.deliveryStatus = "OnTheWay";
    await order.save();

    // 2) Create a new DeliveryAssignment record
    await DeliveryAssignment.create({
      orderId,
      driverName,
      deliveryAddress,
      restaurantAddress,
    });

    return res.json({ message: "Order accepted and assignment saved." });
  } catch (err) {
    console.error("acceptOrder error:", err);
    return res
      .status(500)
      .json({ message: "Server error while accepting order." });
  }
};
