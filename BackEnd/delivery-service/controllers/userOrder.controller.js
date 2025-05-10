/* ------------  src/controllers/userOrder.controller.js ------------- */
const UserOrder = require("../model/userOrder.js");
const generateInvoice = require("../utils/generateInvoice");
const sendEmail = require("../utils/sendEmail.js");
const axios = require('axios');


/* ── util: express async wrapper ── */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ════════════════════════════════ CRUD ═══════════════════════════════ */

/** POST /api/user-orders  ── create a new order */


exports.createOrder = asyncHandler(async (req, res) => {
  const order = await UserOrder.create(req.body);

  // Generate the PDF invoice for the order
  const pdfBuffer = await generateInvoice(order);

  // Send the invoice via email
  await sendEmail({
    to: order.email,
    subject: `Your FasterEats Invoice – Order ${order.orderId}`,
    html: `<p>Hi ${order.firstName || "User"},</p><p>Thank you for your order. Please find your invoice attached.</p>`,
    attachments: [{
      filename: `Invoice-${order.orderId}.pdf`,
      content: pdfBuffer,
    }],
  });

  // Construct the SMS message
  const smsMessage = `Hi ${order.firstName || "Customer"}, your FasterEats order ${order.orderId} was placed successfully! Total: ₹${order.totalAmount}`;

  const smsData = {
    to:"0717746014" , // Ensure 'phone' field exists in request body
    message: smsMessage,
  };

  console.log("Sending SMS with data:", smsData);  // Log the data being sent

  try {
    // Send the SMS using the SMS API
    const response = await axios.post("http://localhost:8888/api/notification/send-sms", smsData);
    console.log("SMS response:", response.data);  // Log the response data
  } catch (error) {
    // Log the detailed error response from the SMS API
    console.error("SMS sending error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Failed to send SMS", error: error.response ? error.response.data : error.message });
  }

  // Return the newly created order in the response
  res.status(201).json(order);
});

/** GET /api/user-orders
 *  ?user=<userId>       ➡ orders placed by a customer
 *  ?regNo=<registerNo>    ➡ orders for a restaurant
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const { user, regNo } = req.query;
  const filter = {};
  if (user)  filter.user  = user;
  if (regNo) filter.restaurantRegisterNumber = regNo;

  const orders = await UserOrder.find(filter).sort({ createdAt: -1 });
  res.json(orders);
});

/** GET /api/user-orders/:id  ── single order */
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await UserOrder.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

/** PATCH /api/user-orders/:id/status
 *  Accepts **any** combination of these keys in the body:
 *    { orderStatus?, deliveryStatus?, deliveryPersonId?, deliveryPersonName?, deliveryPersonPhone? }
 */
exports.updateStatus = asyncHandler(async (req, res) => {
  const allowed = [
    "orderStatus",
    "deliveryStatus",
    "deliveryPersonId",
    "deliveryPersonName",
    "deliveryPersonPhone",
  ];

  /* build dynamic update object */
  const update = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) update[k] = req.body[k];
  });

  if (Object.keys(update).length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields supplied for update." });
  }

  const order = await UserOrder.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

/** DELETE /api/user-orders/:id  ── remove order */
exports.removeOrder = asyncHandler(async (req, res) => {
  const order = await UserOrder.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ message: "Order deleted" });
});
