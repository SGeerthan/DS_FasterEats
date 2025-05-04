const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// Create a new coupon manually (optional)
//router.post('/coupons', couponController.createCoupon);

// Get all coupons
router.get('/coupons', couponController.getAllCoupons);

// Delete a coupon
router.delete('/coupons/:id', couponController.deleteCoupon);

module.exports = router;
