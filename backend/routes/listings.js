const express = require('express');
const router = express.Router();
const { createListing, getListings, getListingById, updateListing, deleteListing, getMyListings, uploadImages, reportListing, getFeaturedListings, getStats, getNearbyListings } = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/featured', getFeaturedListings);
router.get('/stats', getStats);
router.get('/nearby', protect, getNearbyListings);
router.get('/', getListings);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, authorize('seller', 'admin'), createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/upload', protect, upload.array('images', 5), uploadImages);
router.post('/:id/report', protect, reportListing);

module.exports = router;
