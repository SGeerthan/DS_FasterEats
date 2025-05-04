import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    /* ───────── personal / shared ───────── */
    firstName: String,
    lastName:  String,
    email:     { type: String, unique: true, required: true },
    profilePicture: { type: String, default: "" },
    dateOfBirth:    Date,

    /* ───────── restaurant extras ───────── */
    restaurantImages: { type: [String], default: [] },
    restaurantName:   String,
    address:          String,

    /* ───────── phone + register number ───────── */
    phone: String,
    registerNumber: { type: String, unique: true, sparse: true },

    /* ───────── rating ───────── */
    rating:      { type: Number, default: 0 },
    ratingSum:   { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    /* ───────── role ───────── */
    role: {
      type: String,
      enum: ["admin", "taxpayer", "restaurantOwner", "deliveryPerson"],
      default: "taxpayer",
    },

    /* ───────── auth ───────── */
    hashed_password: { type: String, required: true },
  },
  { timestamps: true }
);

/* hash password if modified */
userSchema.pre("save", async function (next) {
  if (this.isModified("hashed_password")) {
    this.hashed_password = await bcrypt.hash(
      this.hashed_password,
      await bcrypt.genSalt(10)
    );
  }
  next();
});

/* auto-generate unique registerNumber */
userSchema.pre("validate", async function (next) {
  if (
    !this.registerNumber &&
    ["restaurantOwner", "deliveryPerson"].includes(this.role)
  ) {
    const prefix = this.role === "restaurantOwner" ? "RES" : "DEL";
    let unique = false;
    while (!unique) {
      const candidate = `${prefix}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`;
      // check for collision
      // eslint-disable-next-line no-await-in-loop
      unique = !(await mongoose.models.User.exists({ registerNumber: candidate }));
      if (unique) this.registerNumber = candidate;
    }
  }
  next();
});

export const User = mongoose.model("User", userSchema);
