const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  provider: {
    type: String,
    enum: ['mpesa', 'paystack'],
    default: 'mpesa'
  },
  mpesaCode: {
    type: String,
    unique: true,
    sparse: true
  },
  checkoutRequestId: {
    type: String,
    unique: true,
    sparse: true
  },
  paystackReference: {
    type: String,
    unique: true,
    sparse: true
  },

  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'verified'],
    default: 'pending'
  },
  adminComment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
