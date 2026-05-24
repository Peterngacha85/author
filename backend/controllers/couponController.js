const crypto = require('crypto');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Book = require('../models/Book');

const createCouponCode = () => {
  return crypto.randomBytes(5).toString('hex').toUpperCase();
};

const generateUniqueCode = async () => {
  let code;
  while (true) {
    code = createCouponCode();
    const existing = await Coupon.findOne({ code });
    if (!existing) break;
  }
  return code;
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .populate('generatedBy', 'name email')
      .populate('usedBy', 'name email');

    res.json(coupons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.generateCoupons = async (req, res) => {
  try {
    const quantity = Math.max(1, Math.min(parseInt(req.body.quantity, 10) || 1, 50));
    const description = req.body.description?.trim() || '';
    const generatedBy = req.user.id;

    const coupons = [];
    for (let i = 0; i < quantity; i += 1) {
      const code = await generateUniqueCode();
      coupons.push({ code, generatedBy, description });
    }

    const created = await Coupon.insertMany(coupons);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.redeemCoupon = async (req, res) => {
  try {
    const code = req.body.code?.trim().toUpperCase();
    if (!code) return res.status(400).json({ msg: 'Please enter a coupon code' });

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });
    if (coupon.status === 'used') return res.status(400).json({ msg: 'This coupon has already been used' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.disabled) return res.status(403).json({ msg: 'Your account is restricted' });

    coupon.status = 'used';
    coupon.usedBy = user._id;
    coupon.usedAt = new Date();
    await coupon.save();

    const books = await Book.find({}, '_id');
    const existingIds = new Set((user.purchasedItems || []).map(id => id.toString()));
    books.forEach(book => existingIds.add(book._id.toString()));
    user.purchasedItems = Array.from(existingIds);
    user.allAccess = true;
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ msg: 'Coupon redeemed successfully', user: updatedUser, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
