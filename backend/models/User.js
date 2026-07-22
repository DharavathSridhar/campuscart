const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  collegeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  campus: { type: String, required: true },
  studentType: { type: String, enum: ['hosteller', 'dayScholar'], default: 'hosteller' },
  hostel: { type: String, default: '' },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  profileImage: { type: String, default: '' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
