/* ------------  src/models/userOrder.model.js ------------- */
const mongoose = require("mongoose");

/* a single cart line (minimal) */
const cartItemSchema = new mongoose.Schema(
  {
    _id:   false,            // prevent automatic ObjectId
    name:  String,
    qty:   Number,
    price: Number,
  },
  { _id: false }
);

const userOrderSchema = new mongoose.Schema(
  {
    /* ——— customer who placed the order ——— */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ——— order meta ——— */
    orderId:       { type: String, required: true, unique: true },
    paymentMethod: { type: String, required: true },

    /* ——— restaurant info ——— */
    restaurantName:           { type: String, required: true },
    restaurantAddress:        { type: String, required: true },
    restaurantRegisterNumber: { type: String, required: true, index: true },

    /* ——— delivery info ——— */
    deliveryAddress: { type: String, required: true },
    deliveryStatus:  {
      type: String,
      enum: [
        "Picked",
        "OnTheWay",
        "DeliveredFromRestaurant",
        "AcceptDelivery",
        "Delivered",
        "Declined",
      ],
      default: "Picked",
    },

    /* NEW — assigned driver / rider info */
    deliveryPersonId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deliveryPersonName:  { type: String, default: null },
    deliveryPersonPhone: { type: String, default: null },

    /* ——— billing ——— */
    totalAmount: { type: Number, required: true },

    /* ——— cart summary ——— */
    cart: { type: [cartItemSchema], default: [] },

    /* ——— status flag ——— */
    orderStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserOrder", userOrderSchema);
