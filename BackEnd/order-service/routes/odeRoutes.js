const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderContoller');



router.get('/pick-up' , OrderController.getPendingOrders);


module.exports = router;