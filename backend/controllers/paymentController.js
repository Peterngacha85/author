const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Book = require('../models/Book');
const { initiateSTKPush } = require('../utils/mpesa');

// Submit Manual Payment (User fallback)
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
      if (user) {
        user.purchasedItems = user.purchasedItems.filter(id => id.toString() !== transaction.bookId.toString());
        await user.save();
      }
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

// Initiate STK Push
exports.stkPush = async (req, res) => {
  try {
    const { bookId, phone } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ msg: 'Book not found' });

    const amount = book.price;
    const mpesaResponse = await initiateSTKPush(phone, amount, book.title);

    // Create a pending transaction
    const newTransaction = new Transaction({
      userId: req.user.id,
      bookId,
      amount,
      status: 'pending',
      checkoutRequestId: mpesaResponse.CheckoutRequestID,
      mpesaCode: 'PENDING_' + mpesaResponse.CheckoutRequestID, // Temporary unique value
      adminComment: 'STK Push Initiated'
    });

    await newTransaction.save();


    res.status(200).json({ 
      msg: 'STK Push initiated. Please enter your PIN on your phone.',
      checkoutRequestId: mpesaResponse.CheckoutRequestID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message || 'Server error during STK Push' });
  }
};

// M-Pesa Callback Handler
exports.handleCallback = async (req, res) => {
    try {
        const { Body } = req.body;
        const result = Body.stkCallback;
        const checkoutRequestId = result.CheckoutRequestID;
        const resultCode = result.ResultCode;

        const transaction = await Transaction.findOne({ checkoutRequestId });
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found for this callback' });


        if (resultCode === 0) {
            // Success
            const mpesaCode = result.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber').Value;
            
            transaction.status = 'verified';
            transaction.mpesaCode = mpesaCode;
            transaction.adminComment = 'Automated M-Pesa Verification';
            await transaction.save();

            // Grant access to the book
            const user = await User.findById(transaction.userId);
            if (!user.purchasedItems.includes(transaction.bookId)) {
                user.purchasedItems.push(transaction.bookId);
                await user.save();
            }
            console.log(`Payment successful for Transaction: ${checkoutRequestId}. M-Pesa Code: ${mpesaCode}`);
        } else {
            // Cancelled or Failed
            transaction.status = 'rejected';
            transaction.adminComment = `M-Pesa Failed: ${result.ResultDesc}`;
            await transaction.save();
            console.log(`Payment failed for Transaction: ${checkoutRequestId}. Reason: ${result.ResultDesc}`);
        }

        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (err) {
        console.error('M-Pesa Callback Error:', err);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

// Check Transaction Status (User)
exports.checkStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const transaction = await Transaction.findOne({ checkoutRequestId });

    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });


    res.json({ 
      status: transaction.status,
      bookId: transaction.bookId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// SIMULATION: Manually approve the last pending STK for testing
exports.simulateSTKSuccess = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ userId: req.user.id, status: 'pending' }).sort({ createdAt: -1 });
        if (!transaction) return res.status(404).json({ msg: 'No pending STK transaction found for your user' });

        transaction.status = 'verified';
        transaction.mpesaCode = 'SIMULATED' + Math.random().toString(36).substring(7).toUpperCase();
        transaction.adminComment = 'Sandbox Simulation Success';
        await transaction.save();

        // Grant access
        const user = await User.findById(req.user.id);
        if (!user.purchasedItems.includes(transaction.bookId)) {
            user.purchasedItems.push(transaction.bookId);
            await user.save();
        }

        res.json({ msg: 'Payment SIMULATED successfully. The modal should close now.', transaction });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Simulation failed' });
    }
};

// Delete Payment (Admin)
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

    // Revoke access before deleting the record
    const user = await User.findById(transaction.userId);
    if (user) {
      user.purchasedItems = user.purchasedItems.filter(pId => pId.toString() !== transaction.bookId.toString());
      await user.save();
    }

    await Transaction.findByIdAndDelete(id);

    res.json({ msg: 'Payment record deleted and access revoked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while deleting' });
  }
};
