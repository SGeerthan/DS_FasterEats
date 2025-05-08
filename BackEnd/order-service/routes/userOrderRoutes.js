/* ------------  BackEnd/order-service/routes/userOrder.routes.js ------------- */
const express  = require("express");
const router   = express.Router();
const ctrl     = require("../controllers/userOrderController");

/* main CRUD */
router.route("/")
  .post(ctrl.createUserOrder)   // restaurant → delivery‑service
  .get(ctrl.getUserOrders);     // list by ?user= or ?regNo=

router.patch("/:id/status", ctrl.updateOrderStatus);   // accept / decline

/* driver‑side helpers */
router.put("/orders/:orderId",            ctrl.acceptOrder);      // set OnTheWay
router.put("/orders/complete/:orderId",   ctrl.completeDelivery); // set Delivered
router.get("/pending",                    ctrl.getPendingOrders); // all orderStatus:false

router.delete("/:id",   ctrl.deleteUserOrder);

module.exports = router;
