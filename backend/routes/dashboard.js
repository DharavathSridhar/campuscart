const express = require('express');
const router = express.Router();
const { getBuyerDashboard, getSellerDashboard, getSustainabilityDashboard, getTransactionHistory } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/buyer', protect, getBuyerDashboard);
router.get('/seller', protect, getSellerDashboard);
router.get('/sustainability', protect, getSustainabilityDashboard);
router.get('/transactions', protect, getTransactionHistory);

module.exports = router;
