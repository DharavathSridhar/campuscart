const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Books', 'Guides', 'Calculator', 'Engineering Kit', 'Lab Kit', 'Boneset', 'Stationery', 'Lab Coat', 'Hostel Essentials', 'Electronics', 'Cycle', 'Furniture', 'Others']
  },
  condition: { type: String, required: true, enum: ['New', 'Good', 'Fair', 'Worn'] },
  transactionType: { type: String, required: true, enum: ['Free', 'Sell', 'Lend'] },
  price: { type: Number, default: 0 },
  lendingDuration: { type: String },
  depositAmount: { type: Number, default: 0 },
  images: [{ type: String }],
  campus: { type: String, required: true },
  hostel: { type: String, required: true },
  building: { type: String, default: '' },
  availability: { type: String, enum: ['Available', 'Reserved', 'Completed'], default: 'Available' },
  views: { type: Number, default: 0 },
  isReported: { type: Boolean, default: false },
  reportReason: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

listingSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
