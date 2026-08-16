// One-off migration: locks existing unused coupons (created before per-book
// scoping existed) to whichever book(s) are currently in the system, so they
// don't silently unlock any future book that gets uploaded.
require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const Book = require('../models/Book');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const books = await Book.find({ comingSoon: { $ne: true } }, '_id title');
  if (books.length === 0) {
    console.log('No available (non-comingSoon) books found — nothing to scope coupons to.');
    process.exit(0);
  }

  const titles = [...new Set(books.map(b => b.title.trim()))];
  if (titles.length > 1) {
    console.log('Multiple distinct book titles found, aborting automatic migration:', titles);
    console.log('Scope these coupons manually since it is ambiguous which title they belong to.');
    process.exit(1);
  }

  const bookIds = books.map(b => b._id);
  const title = titles[0];

  const result = await Coupon.updateMany(
    { status: 'unused', $or: [{ books: { $exists: false } }, { books: { $size: 0 } }] },
    { $set: { books: bookIds, bookTitle: title } }
  );

  console.log(`Scoped ${result.modifiedCount} unused coupon(s) to "${title}".`);
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
