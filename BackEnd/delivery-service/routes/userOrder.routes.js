/* ------------  src/routes/userOrder.routes.js ------------- */
const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateStatus,
  removeOrder,
} = require("../controllers/userOrder.controller");

const router = express.Router();

/* list  +  create */
router.route("/").post(createOrder).get(getOrders);

/* read / delete a single order */
router.route("/:id").get(getOrderById).delete(removeOrder);

/* status / driver‑assignment patch */
router.patch("/:id/status", updateStatus);

/* convenience:  /api/user-orders/user/<uid>  */
router.get(
  "/user/:uid",
  (req, res, next) => {
    req.query.user = req.params.uid;
    next();
  },
  getOrders
);

module.exports = router;
