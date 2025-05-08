/* ------------  src/controllers/userOrder.controller.js ------------- */
const UserOrder = require("../model/userOrder.js");

/* ── util: express async wrapper ── */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ════════════════════════════════ CRUD ═══════════════════════════════ */

/** POST /api/user-orders  ── create a new order */
exports.createOrder = asyncHandler(async (req, res) => {
  const order = await UserOrder.create(req.body);
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
