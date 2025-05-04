import express from "express";
import multer from "multer";
import {
  listAllFoods,   // ← NEW
  addFood,
  myFoods,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";
import { protect } from "../middleware/authMiddleware.js";

const router  = express.Router();
const upload  = multer(); // memory storage

/* ───── PUBLIC ROUTE – everyone can see all dishes ───── */
router.get("/", listAllFoods);

/* ───── OWNER ROUTES – require auth token ───── */
router.use(protect);

router.get("/my", myFoods);                           // GET /foods/my
router.post("/", upload.single("image"), addFood);    // POST /foods
router.put("/:id", upload.single("image"), updateFood);
router.delete("/:id", deleteFood);

export default router;
