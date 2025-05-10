const axios      = require("axios");   
const UserOrder = require("../model/userOrder"); // Updated model import
const Coupon = require("../model/Coupon"); // Import the Coupon model
const { v4: uuidv4 } = require("uuid"); // To generate unique coupon codes (Install uuid: `npm install uuid`)

// Create new order when user places it
exports.createUserOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    /* 1️⃣ If an order with this ID already exists, just return it */
    const existing = await UserOrder.findOne({ orderId });
    if (existing) {
      return res.status(200).json(existing);   // 200 OK – nothing to do
    }

    /* 2️⃣ Otherwise create a brand‑new record */
    const userOrder = new UserOrder(req.body);
    await userOrder.save();

    /* Optional: create coupon logic stays unchanged … */
    let coupon = null;
    if (userOrder.totalAmount > 3000) {
      coupon = new Coupon({
        code: `DISCOUNT-${uuidv4().slice(0, 8).toUpperCase()}`,
        discountAmount: 500,
      });
      await coupon.save();
    }

    const pdfBuffer = await generateInvoice(userOrder);

    await sendEmail({
      to: userOrder.email,
      subject: `Your FasterEats Invoice – Order ${userOrder.orderId}`,
      html: `<p>Hi ${userOrder.firstName || "User"},</p><p>Thank you for your order. Please find your invoice attached.</p>`,
      attachments: [{
        filename: `Invoice-${userOrder.orderId}.pdf`,
        content: pdfBuffer,
      }],
    });
    
      const smsMessage = `Hi ${userOrder.firstName || "Customer"}, your FasterEats order ${userOrder.orderId} was placed successfully! Total: ₹${userOrder.totalAmount}`;
    await axios.post("http://localhost:3000/send-sms", {
      to: userOrder.phone, // Ensure 'phone' field exists in request body
      message: smsMessage,
    });

    res.status(201).json({ order: userOrder, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed saving order", error: err.message });
  }
};

// Get all placed orders

// Controller to fetch orders for a specific user
exports.getUserOrders = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch orders for the specific user
    const orders = await UserOrder.find({ user: userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    // Return the orders as a JSON response
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};


// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    const updatedOrder = await UserOrder.findByIdAndUpdate(
      id,
      { deliveryStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete placed order (optional)
exports.deleteUserOrder = async (req, res) => {
  try {
    const deletedOrder = await UserOrder.findByIdAndDelete(req.params.id); // Delete order using UserOrder model

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all pending orders (status 0)
// controllers/orderController.js


// Get all pending orders (orderStatus: false)
// Get orders with orderStatus false
exports.getPendingOrders = async (req, res) => {
  try {
    // Find orders where orderStatus is false
    const pendingOrders = await UserOrder.find({ orderStatus: false });

    if (pendingOrders.length === 0) {
      return res.status(404).json({ message: "No pending orders found." });
    }

    return res.status(200).json(pendingOrders);
  } catch (error) {
    console.error(error);
    // Return detailed error response to help identify the problem
    return res.status(500).json({
      message: "Server error",
      error: error.message,  // Provide more details in the error response
    });
  }
};
// Accept order (change orderStatus to true, update deliveryStatus)
exports.acceptOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    // Find the order by ID and update its status
    const order = await UserOrder.findByIdAndUpdate(
      orderId,
      {
        orderStatus: true, // Set orderStatus to true (accepted)
        deliveryStatus: "On the Way", // Default delivery status when accepted
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error accepting order" });
  }
};

// Mark order as delivered (change deliveryStatus to "Delivered")
exports.completeDelivery = async (req, res) => {
  const { orderId } = req.params;
  try {
    // Find the order by ID and update deliveryStatus to "Delivered"
    const order = await UserOrder.findByIdAndUpdate(
      orderId,
      { deliveryStatus: "Delivered" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error completing delivery" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, deliveryStatus } = req.body;

    const updated = await UserOrder.findByIdAndUpdate(
      id,
      { orderStatus, deliveryStatus },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    /* ── forward ONLY when accepted ── */
    if (orderStatus === true) {
      // strip Mongo meta so 5004 gets a clean doc
      const { _id, __v, createdAt, updatedAt, ...clean } = updated.toObject();

      try {
        await axios.post("http://localhost:5004/api/user-orders", clean, {
          headers: { "Content-Type": "application/json" },
          // timeout optional
        });
      } catch (fwdErr) {
        console.error("Forwarding to driver service failed:", fwdErr.message);
        // still return 200 to caller; you might log / retry with a queue in prod
      }
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed updating order", error: err.message });
  }
};