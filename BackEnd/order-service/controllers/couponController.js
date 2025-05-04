const Coupon = require('../model/Coupon');

// Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a coupon by ID
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply coupon and update totalAmount
exports.applyCoupon = async (req, res) => {
  try {
    const { orderId, couponCode } = req.body;

    // Find the order by orderId
    const order = await DriverOrder.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the coupon by coupon code
    const coupon = await Coupon.findOne({ code: couponCode, valid: true });
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    // Apply the discount to the totalAmount
    order.totalAmount -= coupon.discountAmount;

    // Make sure the totalAmount doesn't go below zero
    if (order.totalAmount < 0) order.totalAmount = 0;

    // Save the updated order
    await order.save();

    // Optionally mark the coupon as used
    coupon.valid = false; // Invalidates the coupon once used
    await coupon.save();

    res.json({
      message: 'Coupon applied successfully!',
      newTotalAmount: order.totalAmount,
      order: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
