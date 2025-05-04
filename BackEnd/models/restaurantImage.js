import mongoose from "mongoose";

const restaurantImageSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url:   { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("RestaurantImage", restaurantImageSchema);
