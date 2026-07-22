const Request = require('../models/Request');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

exports.sendRequest = async (req, res, next) => {
  try {
    const { listingId, message } = req.body;
    const listing = await Listing.findById(listingId).populate('seller');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot request your own listing' });
    }
    const existing = await Request.findOne({ buyer: req.user._id, listing: listingId, status: { $ne: 'Rejected' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already requested this item' });
    }
    const request = await Request.create({
      buyer: req.user._id,
      seller: listing.seller._id,
      listing: listingId,
      message: message || '',
    });
    await Notification.create({
      user: listing.seller._id,
      title: 'New Request Received',
      message: `${req.user.fullName} wants your item "${listing.title}"`,
      type: 'request',
      link: `/seller/requests`,
    });
    const populated = await request.populate(['buyer', 'seller', 'listing']);
    res.status(201).json({ success: true, request: populated });
  } catch (error) {
    next(error);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ buyer: req.user._id })
      .populate('seller', 'fullName department campus hostel profileImage')
      .populate('listing')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

exports.getSellerRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ seller: req.user._id })
      .populate('buyer', 'fullName department campus hostel profileImage phone')
      .populate('listing')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate(['buyer', 'listing']);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    request.status = 'Accepted';
    await request.save();
    await Listing.findByIdAndUpdate(request.listing._id, { availability: 'Reserved' });
    await Notification.create({
      user: request.buyer._id,
      title: 'Request Accepted',
      message: `Your request for "${request.listing.title}" has been accepted!`,
      type: 'request',
      link: `/buyer/requests`,
    });
    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate(['buyer', 'listing']);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    request.status = 'Rejected';
    await request.save();
    await Notification.create({
      user: request.buyer._id,
      title: 'Request Rejected',
      message: `Your request for "${request.listing.title}" has been rejected.`,
      type: 'request',
      link: `/buyer/requests`,
    });
    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

exports.completeRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate(['buyer', 'seller', 'listing']);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.buyer._id.toString() !== req.user._id.toString() && request.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    request.status = 'Completed';
    await request.save();
    await Listing.findByIdAndUpdate(request.listing._id, { availability: 'Completed' });
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      buyer: request.buyer._id,
      seller: request.seller._id,
      listing: request.listing._id,
      type: request.listing.transactionType,
      amount: request.listing.price || 0,
    });
    await Notification.create({
      user: request.buyer._id,
      title: 'Transaction Completed',
      message: `Your transaction for "${request.listing.title}" has been completed!`,
      type: 'transaction',
    });
    await Notification.create({
      user: request.seller._id,
      title: 'Transaction Completed',
      message: `Transaction for "${request.listing.title}" has been completed!`,
      type: 'transaction',
    });
    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};
