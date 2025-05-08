/* ------------  BackEnd/order-service/model/userOrder.js ------------- */
const mongoose = require("mongoose");

/* single cart line */
const itemSchema = new mongoose.Schema(
  {
    _id:   String,   // food _id (string so we can copy directly)
    name:  String,
    qty:   Number,
    price: Number,
  },
  { _id: false }
);

const userOrderSchema = new mongoose.Schema(
  {
    /* who placed the order */
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    /* order meta */
    orderId:      { type: String, required: true, unique: true },
    paymentMethod:{ type: String, required: true },

    /* restaurant */
    restaurantName:           { type: String, required: true },
    restaurantAddress:        { type: String, required: true },
    restaurantRegisterNumber: { type: String, required: true, index: true },

    /* delivery */
    deliveryAddress: { type: String, required: true },
    deliveryStatus:  { type: String, enum: ["Picked","OnTheWay","Delivered","Declined"], default: "Picked" },

    /* totals + flags */
    totalAmount: { type: Number, required: true },
    orderStatus: { type: Boolean, default: false },

    /* cart lines */
    cart: { type: [itemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserOrders", userOrderSchema);
