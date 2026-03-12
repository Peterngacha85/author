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
