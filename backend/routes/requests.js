const express = require('express');
const router = express.Router();
const { sendRequest, getMyRequests, getSellerRequests, acceptRequest, rejectRequest, completeRequest } = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, sendRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/seller-requests', protect, authorize('seller', 'admin'), getSellerRequests);
router.put('/:id/accept', protect, authorize('seller', 'admin'), acceptRequest);
router.put('/:id/reject', protect, authorize('seller', 'admin'), rejectRequest);
router.put('/:id/complete', protect, completeRequest);

module.exports = router;
