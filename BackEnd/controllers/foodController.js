import Food from "../models/foodModel.js";
import { User } from "../models/userModel.js";
import { imageUploadUnit } from "../helper/cloudinarySetUp.js";

/* ────────────────────────────────────────────── */
/*  PUBLIC – LIST EVERY DISH (no auth required)  */
/* ────────────────────────────────────────────── */
export const listAllFoods = async (_req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to load foods" });
  }
};

/* ────────────────────────────────────────────── */
/*  OWNER – ADD A NEW DISH                       */
/* ────────────────────────────────────────────── */
export const addFood = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price)
      return res.status(400).json({ message: "Name & price required" });

    /* fetch owner details */
    const owner = await User.findById(req.user.id);
    const restaurantRegNo = owner.registerNumber || "";
    const restaurantName  = owner.restaurantName || "";

    /* optional image */
    let imgURL = "";
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      imgURL = (
        await imageUploadUnit(`data:${req.file.mimetype};base64,${b64}`)
      ).secure_url;
    }

    const food = await Food.create({
      owner: owner._id,
      restaurantRegNo,
      restaurantName,
      name,
      description,
      price,
      image: imgURL,
    });

    res.status(201).json(food);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Add food failed" });
  }
};

/* ────────────────────────────────────────────── */
/*  OWNER – LIST ONLY MY DISHES                  */
/* ────────────────────────────────────────────── */
export const myFoods = async (req, res) => {
  const foods = await Food.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(foods);
};

/* ────────────────────────────────────────────── */
/*  OWNER – UPDATE                               */
/* ────────────────────────────────────────────── */
export const updateFood = async (req, res) => {
  const food = await Food.findOne({ _id: req.params.id, owner: req.user.id });
  if (!food) return res.status(404).json({ message: "Not found" });

  const { name, description, price } = req.body;
  if (name)        food.name        = name;
  if (description) food.description = description;
  if (price)       food.price       = price;

  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    food.image = (
      await imageUploadUnit(`data:${req.file.mimetype};base64,${b64}`)
    ).secure_url;
  }

  await food.save();
  res.json(food);
};

/* ────────────────────────────────────────────── */
/*  OWNER – DELETE                               */
/* ────────────────────────────────────────────── */
export const deleteFood = async (req, res) => {
  const food = await Food.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id,
  });
  if (!food) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};
