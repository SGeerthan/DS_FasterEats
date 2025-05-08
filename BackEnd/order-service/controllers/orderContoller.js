/* ------------  BackEnd/order-service/controllers/userOrderController.js ------------- */
const UserOrder = require("../model/userOrder");

/* helper wrapper */
const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

/* ─────────────  CUSTOMER (and restaurant) CRUD ───────────── */

/** POST / — create new order (called by restaurant -> delivery‑service) */
exports.createUserOrder = asyncHandler(async (req, res) => {
  const order = await UserOrder.create(req.body);
  res.status(201).json(order);
});

/** GET / api/user-orders
 *  ?user=<userId>   — orders of a user
 *  ?regNo=ABC123…   — orders for a restaurant register number
 */
exports.getUserOrders = asyncHandler(async (req,res) =>{
  const { user, regNo } = req.query;
  const filter = {};
  if (user)  filter.user  = user;
  if (regNo) filter.restaurantRegisterNumber = regNo.toUpperCase();
  const orders = await UserOrder.find(filter).sort({ createdAt:-1 });
  res.json(orders);
});

/** PATCH /:id/status — accept or decline from restaurant */
exports.updateOrderStatus = asyncHandler(async (req,res) =>{
  const { orderStatus, deliveryStatus } = req.body;
  const order = await UserOrder.findByIdAndUpdate(
    req.params.id,
    { orderStatus, deliveryStatus },
    { new:true }
  );
  if (!order) return res.status(404).json({ message:"Order not found" });
  res.json(order);
});

/* ─────────────  DRIVER SERVICE helpers (optional) ───────────── */

/** PUT /orders/:orderId — driver accepts (sets OnTheWay) */
exports.acceptOrder = asyncHandler(async (req,res) =>{
  const order = await UserOrder.findOneAndUpdate(
    { orderId:req.params.orderId },
    { deliveryStatus:"OnTheWay" },
    { new:true }
  );
  if (!order) return res.status(404).json({ message:"Order not found" });
  res.json(order);
});

/** PUT /orders/complete/:orderId — driver delivered */
exports.completeDelivery = asyncHandler(async (req,res)=>{
  const order = await UserOrder.findOneAndUpdate(
    { orderId:req.params.orderId },
    { deliveryStatus:"Delivered" },
    { new:true }
  );
  if (!order) return res.status(404).json({ message:"Order not found" });
  res.json(order);
});

/** GET /pending — all orders not yet accepted */
exports.getPendingOrders = asyncHandler(async (req,res)=>{
  const list = await UserOrder.find({ orderStatus:false });
  res.json(list);
});

/** DELETE /:id */
exports.deleteUserOrder = asyncHandler(async (req,res)=>{
  const doc = await UserOrder.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message:"Order not found" });
  res.json({ message:"Deleted" });
});
