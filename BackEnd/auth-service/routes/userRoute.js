// backend/routes/userRoute.js
import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getUserProfile,
  updateUser,
  updateAnyUser,
  deleteUser,
  uploadProfilePicture,
  uploadRestaurantImages,
  updateUserRole,
  getPublicUser,
  rateUser       // ← public‐profile fetch
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../helper/cloudinarySetUp.js";

const router = express.Router();

/* ─── Public auth endpoints ─── */
router.post("/register", registerUser);
router.post("/login", loginUser);

/* ─── Protected (must be logged in) ─── */
router.get("/profile", protect, getUserProfile);
router.put("/update", protect, updateUser);
router.post(
  "/upload-profile",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture
);

/* ─── Admin only ─── */
router.get("/", protect, adminOnly, getUsers);
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deleteUser);
router.get("/", protect, adminOnly, getUsers);
router.put("/:id", protect, adminOnly, updateAnyUser);   // ← new
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deleteUser);

/* ─── Restaurant-owner gallery ─── */
router.post(
  "/upload-restaurant",
  protect,
  upload.array("images", 5),
  uploadRestaurantImages
);

/* ─── Public: fetch any user/restaurant by ID ─── */
router.get("/:id", getPublicUser);


router.post("/:id/rate", protect, rateUser);

export default router;
