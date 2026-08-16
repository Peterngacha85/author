const crypto = require('crypto');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Book = require('../models/Book');

const createCouponCode = () => {
  return crypto.randomBytes(5).toString('hex').toUpperCase();
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
      .populate('usedBy', 'name email')
      .populate('books', 'title type');

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

    const bookId = req.body.bookId;
    if (!bookId) return res.status(400).json({ msg: 'Please select a book for these coupons' });

    const selectedBook = await Book.findById(bookId, 'title');
    if (!selectedBook) return res.status(404).json({ msg: 'Book not found' });

    // Grab every format (ebook + audiobook) that shares this title so one coupon unlocks both.
    const titleRegex = new RegExp(`^${escapeRegex(selectedBook.title.trim())}$`, 'i');
    const matchingBooks = await Book.find({ title: titleRegex }, '_id');
    const bookIds = matchingBooks.map(b => b._id);

    const coupons = [];
    for (let i = 0; i < quantity; i += 1) {
      const code = await generateUniqueCode();
      coupons.push({ code, generatedBy, description, books: bookIds, bookTitle: selectedBook.title });
    }

    const created = await Coupon.insertMany(coupons);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });
    await coupon.deleteOne();
    res.json({ msg: 'Coupon deleted' });
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
    if (!coupon.books || coupon.books.length === 0) {
      return res.status(400).json({ msg: 'This coupon is not assigned to a book. Contact the admin.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.disabled) return res.status(403).json({ msg: 'Your account is restricted' });

    coupon.status = 'used';
    coupon.usedBy = user._id;
    coupon.usedAt = new Date();
    await coupon.save();

    const existingIds = new Set((user.purchasedItems || []).map(id => id.toString()));
    coupon.books.forEach(id => existingIds.add(id.toString()));
    user.purchasedItems = Array.from(existingIds);
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ msg: `Coupon redeemed — "${coupon.bookTitle}" unlocked`, user: updatedUser, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
