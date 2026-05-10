const User = require('../models/User');
const Book = require('../models/Book');

// Get all users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Toggle user disabled status
exports.toggleUserAccess = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.disabled = !user.disabled;
    await user.save();
    res.json({ msg: 'User access updated', disabled: user.disabled });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a user (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ msg: 'Cannot delete an admin' });
    await user.deleteOne();
    res.json({ msg: 'User removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
// Delete a book (Admin)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    await Book.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Book removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all password reset requests (Admin)
exports.getPasswordResets = async (req, res) => {
  try {
    const PasswordReset = require('../models/PasswordReset');
    const requests = await PasswordReset.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Resolve a password reset request (Admin)
exports.resolvePasswordReset = async (req, res) => {
  try {
    const PasswordReset = require('../models/PasswordReset');
    const request = await PasswordReset.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });

    request.status = 'resolved';
    request.adminNote = req.body.adminNote || 'Resolved';
    await request.save();
    res.json({ msg: 'Request marked as resolved', request });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a password reset request (Admin)
exports.deletePasswordReset = async (req, res) => {
  try {
    const PasswordReset = require('../models/PasswordReset');
    await PasswordReset.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
