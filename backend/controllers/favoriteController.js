const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');
const User = require('../models/User');

exports.addFavorite = async (req, res, next) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    const existing = await Favorite.findOne({ user: req.user._id, listing: listingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }
    await Favorite.create({ user: req.user._id, listing: listingId });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: listingId } });
    res.status(200).json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    next(error);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    await Favorite.findOneAndDelete({ user: req.user._id, listing: req.params.listingId });
    await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: req.params.listingId } });
    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({ path: 'listing', populate: { path: 'seller', select: 'fullName department campus hostel profileImage' } });
    res.status(200).json({ success: true, count: favorites.length, favorites: favorites.map(f => f.listing) });
  } catch (error) {
    next(error);
  }
};
