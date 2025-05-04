const mongoose = require("mongoose");

const userOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    restaurentName: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: Boolean,
      default: false
    },
    deliveryStatus: {
      type: String,
      enum: ["Picked", "OnTheWay", "Delivered"], // Optional: restrict values
      default: "Picked",
    },
    restaurentAddress: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

const UserOrder = mongoose.model("UserOrder", userOrderSchema);

module.exports = UserOrder;
