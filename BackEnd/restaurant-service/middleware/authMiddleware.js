import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";
import { JWT_SECRET } from "../config.js";

// Protect routes
export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token,JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-hashed_password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Admin-only routes
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Admin-only routes
export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== "superAdmin") {
    return res.status(403).json({ message: "Super Admin access required" });
  }
  next();
};

// quick helpers
export const ownerOnly = (req, res, next) => {
  if (req.user.role !== "restaurantOwner") {
    return res.status(403).json({ message: "Restaurant owner access required" });
  }
  next();
};

export const courierOnly = (req, res, next) => {
  if (req.user.role !== "deliveryPerson") {
    return res.status(403).json({ message: "Delivery person access required" });
  }
  next();
};
