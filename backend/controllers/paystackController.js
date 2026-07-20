const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Book = require('../models/Book');
const { verifyTransaction } = require('../utils/paystack');

// Initialize a Paystack payment (creates a pending Transaction, returns config for the popup)
exports.initializePayment = async (req, res) => {
  try {
    const { bookId, email } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    if (!email) return res.status(400).json({ msg: 'Email is required for card payment' });

    const amount = book.price;
    const reference = `PSK_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const newTransaction = new Transaction({
      userId: req.user.id,
      bookId,
      provider: 'paystack',
      paystackReference: reference,
      mpesaCode: undefined,
      amount,
      currency: 'KES',
      status: 'pending',
      adminComment: 'Paystack Initiated'
    });

    await newTransaction.save();

    res.status(200).json({
      msg: 'Payment initialized',
      reference,
      amount,
      email,
      currency: 'KES',
      publicKey: process.env.PAYSTACK_PUBLIC_KEY
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error during Paystack initialization' });
  }
};

// Verify a Paystack payment (called by the frontend right after the popup succeeds)
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ msg: 'Reference is required' });

    const transaction = await Transaction.findOne({ paystackReference: reference });
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

    // Only the owner of the transaction can trigger its verification
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to verify this transaction' });
    }

    if (transaction.status === 'verified') {
      return res.json({ msg: 'Payment already verified', transaction });
    }

    const data = await verifyTransaction(reference);

    const paidCorrectAmount = data.amount === Math.round(transaction.amount * 100);
    const paidCorrectCurrency = data.currency === 'KES';

    if (data.status === 'success' && paidCorrectAmount && paidCorrectCurrency) {
      transaction.status = 'verified';
      transaction.adminComment = 'Automated Paystack Verification';
      await transaction.save();

      const user = await User.findById(transaction.userId);
      if (user) {
        const bookIdStr = transaction.bookId.toString();
        const alreadyPurchased = user.purchasedItems.some(id => id.toString() === bookIdStr);
        if (!alreadyPurchased) {
          user.purchasedItems.push(transaction.bookId);
          await user.save();
        }
      }

      return res.json({ msg: 'Payment verified! Access granted.', transaction });
    }

    transaction.status = 'rejected';
    transaction.adminComment = `Paystack verification failed (status: ${data.status})`;
    await transaction.save();
    return res.status(400).json({ msg: 'Payment could not be verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error during Paystack verification' });
  }
};

// Paystack webhook — async, server-to-server confirmation
exports.webhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(req.rawBody || Buffer.from(JSON.stringify(req.body)))
      .digest('hex');

    if (hash !== signature) {
      console.error('Paystack webhook: invalid signature');
      return res.status(200).json({ received: true });
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const data = event.data;
      const transaction = await Transaction.findOne({ paystackReference: data.reference });

      if (transaction && transaction.status !== 'verified') {
        const paidCorrectAmount = data.amount === Math.round(transaction.amount * 100);
        const paidCorrectCurrency = data.currency === 'KES';

        if (paidCorrectAmount && paidCorrectCurrency) {
          transaction.status = 'verified';
          transaction.adminComment = 'Automated Paystack Webhook Verification';
          await transaction.save();

          const user = await User.findById(transaction.userId);
          if (user) {
            const bookIdStr = transaction.bookId.toString();
            const alreadyPurchased = user.purchasedItems.some(id => id.toString() === bookIdStr);
            if (!alreadyPurchased) {
              user.purchasedItems.push(transaction.bookId);
              await user.save();
            }
          }
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('CRITICAL: Paystack Webhook Processing Error:', err);
    res.status(200).json({ received: true });
  }
};
