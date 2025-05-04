import RestaurantImage from "../models/restaurantImage.js";
import { imageUploadUnit } from "../helper/cloudinarySetUp.js";

/* POST /restaurant-images  (owner only) */
export const uploadRestaurantImage = async (req, res) => {
  try {
    if (req.user.role !== "restaurantOwner")
      return res.status(403).json({ message: "Only restaurant owners can upload" });

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const { secure_url } = await imageUploadUnit(dataURI);

    const img = await RestaurantImage.create({
      owner: req.user.id,
      url: secure_url
    });

    res.status(201).json(img);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Upload failed" });
  }
};

/* GET /restaurant-images/my */
export const myRestaurantImages = async (req, res) => {
  const images = await RestaurantImage.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(images);
};
