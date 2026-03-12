const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Book = require('../models/Book');

// Submit Manual Payment (User)
exports.submitPayment = async (req, res) => {
  try {
    const { mpesaCode, bookId, amount } = req.body;
    
    // Check if duplicate code
    const existing = await Transaction.findOne({ mpesaCode });
    if (existing) return res.status(400).json({ msg: 'Transaction code already submitted' });

    const newTransaction = new Transaction({
      userId: req.user.id,
      bookId,
      mpesaCode,
      amount
    });

    await newTransaction.save();

    // Requirement: Immediate access (Manual revocation later by admin)
    const user = await User.findById(req.user.id);
    if (!user.purchasedItems.includes(bookId)) {
      user.purchasedItems.push(bookId);
      await user.save();
    }

    res.status(201).json({ msg: 'Payment submitted. Access granted. Pending admin verification.', transaction: newTransaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Confirm/Reject Payment (Admin)
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId, status, adminComment } = req.body;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

    transaction.status = status;
    transaction.adminComment = adminComment;
    await transaction.save();

    // If rejected, remove access
    if (status === 'rejected') {
      const user = await User.findById(transaction.userId);
      user.purchasedItems = user.purchasedItems.filter(id => id.toString() !== transaction.bookId.toString());
      await user.save();
    }

    res.json({ msg: `Payment ${status}`, transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all payments (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name phone')
      .populate('bookId', 'title')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Placeholder for STK Push
exports.stkPush = async (req, res) => {
  try {
    const { bookId, phone } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ msg: 'Book not found' });

    const amount = book.price;
    
    // LOGIC: Once Daraja API keys are provided:
    // 1. Get Access Token
    // 2. Format request with amount (book.price) and phone
    // 3. Send STK Push request to Safaricom
    
    console.log(`Simulating STK Push for ${book.title} - Amount: ${amount} to Phone: ${phone}`);

    res.status(200).json({ 
      msg: `STK Push initiated for ${book.title}. Please check your phone.`,
      amount,
      phone
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
