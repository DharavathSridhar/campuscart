const Transaction = require('../models/Transaction');
const Request = require('../models/Request');
const Listing = require('../models/Listing');

exports.getBuyerDashboard = async (req, res, next) => {
  try {
    const requestsSent = await Request.countDocuments({ buyer: req.user._id });
    const acceptedRequests = await Request.countDocuments({ buyer: req.user._id, status: 'Accepted' });
    const completedTransactions = await Request.countDocuments({ buyer: req.user._id, status: 'Completed' });

    const transactions = await Transaction.find({ buyer: req.user._id });
    const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const freeItems = transactions.filter(t => t.type === 'Free').length;
    const moneySaved = freeItems * 500 + completedTransactions * 200;

    const recentRequests = await Request.find({ buyer: req.user._id })
      .populate('seller', 'fullName profileImage')
      .populate('listing')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      dashboard: {
        requestsSent,
        acceptedRequests,
        completedTransactions,
        moneySaved,
        totalSpent,
        recentRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSellerDashboard = async (req, res, next) => {
  try {
    const activeListings = await Listing.countDocuments({ seller: req.user._id, availability: 'Available' });
    const soldItems = await Listing.countDocuments({ seller: req.user._id, availability: 'Completed', transactionType: 'Sell' });
    const lentItems = await Listing.countDocuments({ seller: req.user._id, availability: 'Completed', transactionType: 'Lend' });
    const donatedItems = await Listing.countDocuments({ seller: req.user._id, availability: 'Completed', transactionType: 'Free' });

    const transactions = await Transaction.find({ seller: req.user._id });
    const totalEarnings = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const requestsReceived = await Request.countDocuments({ seller: req.user._id });

    const myListings = await Listing.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const incomingRequests = await Request.find({ seller: req.user._id })
      .populate('buyer', 'fullName profileImage department')
      .populate('listing')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      dashboard: {
        activeListings,
        soldItems,
        lentItems,
        donatedItems,
        totalEarnings,
        requestsReceived,
        myListings,
        incomingRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSustainabilityDashboard = async (req, res, next) => {
  try {
    const userTransactions = await Transaction.find({ $or: [{ buyer: req.user._id }, { seller: req.user._id }] });
    const personalItemsReused = userTransactions.filter(t => t.type !== 'Free').length;
    const personalItemsDonated = await Transaction.countDocuments({ seller: req.user._id, type: 'Free' });
    const personalItemsLent = await Transaction.countDocuments({ $or: [{ buyer: req.user._id }, { seller: req.user._id }], type: 'Lend' });
    const personalMoneySaved = personalItemsReused * 500 + personalItemsDonated * 300;
    const personalWasteReduced = personalItemsReused * 2;
    const personalCO2Reduced = personalItemsReused * 1.5;

    const totalTransactions = await Transaction.countDocuments();
    const allReused = await Transaction.countDocuments({ type: { $in: ['Sell', 'Lend'] } });
    const allDonated = await Transaction.countDocuments({ type: 'Free' });
    const communityMoneySaved = allReused * 500 + allDonated * 300;
    const communityWasteReduced = allReused * 2;
    const communityCO2Saved = allReused * 1.5;

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = await Transaction.countDocuments({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } });
      const savings = count * 400;
      monthlyData.push({
        month: date.toLocaleString('default', { month: 'short' }),
        transactions: count,
        savings,
      });
    }

    const categoryData = await Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.status(200).json({
      success: true,
      sustainability: {
        personal: {
          itemsReused: personalItemsReused,
          itemsDonated: personalItemsDonated,
          itemsLent: personalItemsLent,
          moneySaved: personalMoneySaved,
          wasteReduced: personalWasteReduced,
          co2Reduced: personalCO2Reduced,
        },
        community: {
          totalTransactions,
          totalReused: allReused,
          totalDonated: allDonated,
          totalMoneySaved: communityMoneySaved,
          totalWasteReduced: communityWasteReduced,
          totalCO2Saved: communityCO2Saved,
        },
        monthlyData,
        categoryData,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ $or: [{ buyer: req.user._id }, { seller: req.user._id }] })
      .populate('buyer', 'fullName profileImage')
      .populate('seller', 'fullName profileImage')
      .populate('listing')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    next(error);
  }
};
