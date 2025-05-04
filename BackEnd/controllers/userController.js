// backend/controllers/userController.js
import { User } from "../models/userModel.js";
import { imageUploadUnit } from "../helper/cloudinarySetUp.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../config.js";

/* ───────────────── JWT helper ───────────────── */
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

/* ───────────────── PROFILE PIC (single) ───────────────── */
export const uploadProfilePicture = async (req, res) => {
  try {
    const uri = `data:${req.file.mimetype};base64,${Buffer.from(
      req.file.buffer
    ).toString("base64")}`;
    const { secure_url } = await imageUploadUnit(uri);

    const me = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: secure_url },
      { new: true }
    );
    if (!me) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, url: secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload error" });
  }
};

/* ───────────────── RESTAURANT GALLERY (multi) ───────────────── */
export const uploadRestaurantImages = async (req, res) => {
  try {
    if (req.user.role !== "restaurantOwner")
      return res
        .status(403)
        .json({ message: "Only restaurant owners can upload" });
    if (!req.files?.length)
      return res.status(400).json({ message: "No files provided" });

    const urls = [];
    for (const f of req.files) {
      const data = `data:${f.mimetype};base64,${Buffer.from(f.buffer).toString(
        "base64"
      )}`;
      urls.push((await imageUploadUnit(data)).secure_url);
    }

    const owner = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { restaurantImages: { $each: urls } } },
      { new: true }
    );

    res.json({ success: true, urls, gallery: owner.restaurantImages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

/* ───────────────── REGISTER ───────────────── */
export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      restaurantName,
      address,
      phone,
      email,
      dateOfBirth,
      role = "taxpayer",
      password,
    } = req.body;

    /* base checks */
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already in use" });

    /* role-specific required fields */
    if (
      role === "restaurantOwner" &&
      (!restaurantName || !address || !phone)
    ) {
      return res
        .status(400)
        .json({ message: "All restaurant fields are required" });
    }
    if (
      role === "deliveryPerson" &&
      (!firstName || !lastName || !phone)
    ) {
      return res
        .status(400)
        .json({ message: "All delivery-person fields are required" });
    }

    /* create user – registerNumber auto via model hook */
    const newUser = await User.create({
      firstName,
      lastName,
      restaurantName,
      address,
      phone,
      email,
      dateOfBirth,
      role,                // now honors "admin" if passed
      hashed_password: password,
    });

    res.status(201).json({
      success: true,
      token:   generateToken(newUser),
      user: {
        id:            newUser._id,
        firstName,
        lastName,
        restaurantName,
        email,
        role:           newUser.role,
        registerNumber: newUser.registerNumber,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ───────────────── LOGIN ───────────────── */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.hashed_password);
    if (!ok)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      token: generateToken(user),
      user: {
        id:             user._id,
        firstName:      user.firstName,
        lastName:       user.lastName,
        restaurantName: user.restaurantName,
        email:          user.email,
        profilePicture: user.profilePicture,
        role:           user.role,
        registerNumber: user.registerNumber,
        rating:         user.rating,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ───────────────── RATE USER (1-5) ───────────────── */
export const rateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    if (!(rating >= 1 && rating <= 5))
      return res.status(400).json({ message: "Rating must be 1-5" });

    const target = await User.findById(id);
    if (!target || !["restaurantOwner","deliveryPerson"].includes(target.role))
      return res
        .status(404)
        .json({ message: "User not found or not rateable" });

    target.ratingSum   += rating;
    target.ratingCount += 1;
    target.rating       = target.ratingSum / target.ratingCount;
    await target.save();

    res.json({ success: true, rating: target.rating.toFixed(1) });
  } catch (err) {
    console.error("Rate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────────── GET ALL USERS (admin) ───────────────── */
export const getUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-hashed_password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ───────────────── GET OWN PROFILE ───────────────── */
export const getUserProfile = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select("-hashed_password");
    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(me);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ───────────────── UPDATE OWN PROFILE ───────────────── */
export const updateUser = async (req, res) => {
  try {
    const u = await User.findById(req.user.id);
    if (!u) return res.status(404).json({ message: "User not found" });

    u.firstName      = req.body.firstName      ?? u.firstName;
    u.lastName       = req.body.lastName       ?? u.lastName;
    u.restaurantName = req.body.restaurantName ?? u.restaurantName;
    u.address        = req.body.address        ?? u.address;
    u.phone          = req.body.phone          ?? u.phone;
    if (req.body.profilePicture) u.profilePicture = req.body.profilePicture;

    if (req.body.email && req.body.email !== u.email) {
      if (await User.findOne({ email: req.body.email }))
        return res.status(400).json({ message: "Email already in use" });
      u.email = req.body.email;
    }

    if (req.body.dateOfBirth) {
      const d = new Date(req.body.dateOfBirth);
      if (isNaN(d)) return res.status(400).json({ message: "Invalid date" });
      u.dateOfBirth = d;
    }

    if (req.body.password)
      u.hashed_password = await bcrypt.hash(req.body.password, 10);

    await u.save();
    const { hashed_password, ...clean } = u.toObject();
    res.json({ message: "User updated", user: clean });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────────────── DELETE USER (admin) ───────────────── */
export const deleteUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "User not found" });
    await u.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ───────────────── UPDATE USER ROLE (admin) ───────────────── */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: "Role is required" });

    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "User not found" });

    u.role = role;
    await u.save();
    res.json({ message: "Role updated", role });
  } catch (err) {
    console.error("Role update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────── PUBLIC: get any user’s public profile (no auth) ───────── */
export const getPublicUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select(
      "-hashed_password -ratingSum -ratingCount"
    );
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json(u);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ───────────────── UPDATE ANY USER (admin) ─────────────────
export const updateAnyUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "User not found" });

    // same fields you allow them to edit in your modal:
    u.firstName      = req.body.firstName ?? u.firstName;
    u.lastName       = req.body.lastName  ?? u.lastName;
    u.email          = req.body.email     ?? u.email;
    u.dateOfBirth    = req.body.dateOfBirth
                          ? new Date(req.body.dateOfBirth)
                          : u.dateOfBirth;
    u.restaurantName = req.body.restaurantName ?? u.restaurantName;
    u.address        = req.body.address        ?? u.address;
    u.phone          = req.body.phone          ?? u.phone;

    // if they tried to change email, re-check uniqueness
    if (req.body.email && req.body.email !== u.email) {
      if (await User.findOne({ email: req.body.email }))
        return res.status(400).json({ message: "Email already in use" });
      u.email = req.body.email;
    }

    await u.save();
    const { hashed_password, ...safe } = u.toObject();
    res.json({ message: "User updated", user: safe });
  } catch (err) {
    console.error("Admin update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};