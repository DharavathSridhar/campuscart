const Listing = require('../models/Listing');
const User = require('../models/User');

exports.createListing = async (req, res, next) => {
  try {
    const { title, description, category, condition, transactionType, price, lendingDuration, depositAmount, campus, hostel, building, availability, images } = req.body;

    const listing = await Listing.create({
      seller: req.user._id,
      title, description, category, condition, transactionType,
      price: transactionType === 'Sell' ? price : 0,
      lendingDuration: transactionType === 'Lend' ? lendingDuration : '',
      depositAmount: transactionType === 'Lend' ? depositAmount || 0 : 0,
      images: images || [],
      campus, hostel, building: building || '',
      availability: availability || 'Available',
    });

    const populated = await listing.populate('seller', 'fullName department campus hostel profileImage');
    res.status(201).json({ success: true, listing: populated });
  } catch (error) {
    next(error);
  }
};

exports.getListings = async (req, res, next) => {
  try {
    const { search, category, condition, transactionType, campus, hostel, minPrice, maxPrice, availability, sort, page = 1, limit = 12 } = req.query;

    let query = { isReported: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (transactionType) query.transactionType = transactionType;
    if (campus) query.campus = campus;
    if (hostel) query.hostel = hostel;
    if (availability) query.availability = availability;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'priceLow') sortOption = { price: 1 };
    else if (sort === 'priceHigh') sortOption = { price: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('seller', 'fullName department campus hostel profileImage')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      listings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getNearbyListings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sameHostel = await Listing.find({ hostel: user.hostel, campus: user.campus, availability: 'Available', isReported: false })
      .populate('seller', 'fullName department campus hostel profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    const sameCampus = await Listing.find({ campus: user.campus, hostel: { $ne: user.hostel }, availability: 'Available', isReported: false })
      .populate('seller', 'fullName department campus hostel profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    const otherCampuses = await Listing.find({ campus: { $ne: user.campus }, availability: 'Available', isReported: false })
      .populate('seller', 'fullName department campus hostel profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      sameHostel,
      sameCampus,
      otherCampuses,
    });
  } catch (error) {
    next(error);
  }
};

exports.getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'fullName department campus hostel profileImage phone email');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    listing.views += 1;
    await listing.save();
    res.status(200).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('seller', 'fullName department campus hostel profileImage');
    res.status(200).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('seller', 'fullName department campus hostel profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: listings.length, listings });
  } catch (error) {
    next(error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ success: true, images: imageUrls });
  } catch (error) {
    next(error);
  }
};

exports.reportListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    listing.isReported = true;
    listing.reportReason = req.body.reason || 'Reported by user';
    listing.reportedBy = req.user._id;
    await listing.save();
    res.status(200).json({ success: true, message: 'Listing reported successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedListings = async (req, res, next) => {
  try {
    const featured = await Listing.find({ availability: 'Available', isReported: false })
      .populate('seller', 'fullName department campus hostel profileImage')
      .sort({ views: -1, createdAt: -1 })
      .limit(8);
    res.status(200).json({ success: true, listings: featured });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const totalListings = await Listing.countDocuments();
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalTransactions = await require('../models/Transaction').countDocuments();
    const itemsReused = await Listing.countDocuments({ transactionType: { $in: ['Sell', 'Lend'] } });
    const estimatedMoneySaved = itemsReused * 500;
    const wasteReduced = itemsReused * 2;
    res.status(200).json({
      success: true,
      stats: { totalListings, totalUsers, totalTransactions, itemsReused, estimatedMoneySaved, wasteReduced },
    });
  } catch (error) {
    next(error);
  }
};
