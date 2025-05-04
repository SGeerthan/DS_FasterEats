import express from "express";
import mongoose from "mongoose";
import { PORT, mongodbURL } from "./config.js";
import cors from "cors";
import foodRoute from "./routes/foodRoutes.js";
import restaurantImageRoute from "./routes/foodRoutes.js";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  console.log(req);
  return res.status(234).send("Welcome to MERN Stack");
});


// Routes for logics
app.use('/foods', foodRoute);
app.use("/restaurant-images", restaurantImageRoute);

mongoose
  .connect(mongodbURL)
  .then(() => {
    console.log("App Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Failed to connect to MongoDB", error);
  });
