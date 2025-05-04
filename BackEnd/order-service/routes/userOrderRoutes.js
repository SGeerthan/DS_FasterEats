const express = require('express');
const router = express.Router();
const driverOrderController = require('../controllers/userOrderController');
const couponController = require('../controllers/couponController'); 

router.post('/', driverOrderController.createOrder);
router.get("/:userId", driverOrderController.getUserOrders);
router.put('/:id', driverOrderController.updateDeliveryStatus);
router.delete('/:id', driverOrderController.deleteUserOrder);

router.post('/orders/apply-coupon', couponController.applyCoupon);

// Get all pending orders (orderStatus: false)

// Accept an order (update orderStatus to true, deliveryStatus to "On the Way")
router.put("/orders/:orderId", driverOrderController.acceptOrder);

// Complete the delivery (update deliveryStatus to "Delivered")
router.put("/orders/complete/:orderId", driverOrderController.completeDelivery);
module.exports = router;
