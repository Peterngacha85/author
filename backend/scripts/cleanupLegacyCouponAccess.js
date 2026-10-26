// One-off cleanup: the old unscoped coupons added EVERY book in the database to
// the redeemer's purchasedItems (including Coming Soon books) and set allAccess.
// This rebuilds each user's library from what they actually paid for or redeemed:
//   - verified/confirmed transactions
//   - scoped coupons (coupon.books)
//   - legacy unscoped coupons -> the book that was live back then (LEGACY_TITLE)
// Dry run by default; pass --apply to write changes.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Coupon = require('../models/Coupon');
const Transaction = require('../models/Transaction');

const LEGACY_TITLE = 'Just One Text';
const apply = process.argv.includes('--apply');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const books = await Book.find({}, '_id title');
  const titleById = new Map(books.map(b => [b._id.toString(), b.title]));
  const legacyIds = books
    .filter(b => b.title.trim().toLowerCase() === LEGACY_TITLE.toLowerCase())
    .map(b => b._id.toString());
  if (legacyIds.length === 0) throw new Error(`No book titled "${LEGACY_TITLE}" found`);

  const users = await User.find({ role: { $ne: 'admin' } }, 'name email phone purchasedItems allAccess');
  let changed = 0;

  for (const user of users) {
    const allowed = new Set();

    const txs = await Transaction.find({ userId: user._id, status: { $in: ['verified', 'confirmed'] } }, 'bookId');
    txs.forEach(t => allowed.add(t.bookId.toString()));

    const coupons = await Coupon.find({ usedBy: user._id, status: 'used' }, 'books');
    coupons.forEach(c => {
      if (c.books && c.books.length > 0) c.books.forEach(id => allowed.add(id.toString()));
      else legacyIds.forEach(id => allowed.add(id));
    });

    const current = (user.purchasedItems || []).map(id => id.toString());
    const kept = current.filter(id => allowed.has(id));
    const removed = current.filter(id => !allowed.has(id));

    if (removed.length === 0 && !user.allAccess) continue;
    changed += 1;

    console.log(`${user.name || '(no name)'} <${user.email || user.phone || user._id}>`);
    if (user.allAccess) console.log('  allAccess: true -> false');
    removed.forEach(id => console.log(`  remove: ${titleById.get(id) || '(deleted book)'} [${id}]`));

    if (apply) {
      user.purchasedItems = kept;
      user.allAccess = false;
      await user.save();
    }
  }

  console.log(`\n${changed} user(s) affected. ${apply ? 'Changes applied.' : 'Dry run — rerun with --apply to save.'}`);
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
