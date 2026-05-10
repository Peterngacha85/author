const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);
