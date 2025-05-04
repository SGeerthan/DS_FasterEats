import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadRestaurantImage,
  myRestaurantImages
} from "../controllers/restaurantImageController.js";

const router = express.Router();
const upload = multer(); // memory storage

router.use(protect);

router.post("/", upload.single("image"), uploadRestaurantImage);
router.get("/my", myRestaurantImages);

export default router;
