const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ebook', 'audiobook'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  comingSoon: {
    type: Boolean,
    default: false
  },
  coverImage: {
    url: String,
    public_id: String
  },
  // For eBooks (PDF/EPUB)
  fileUrl: {
    url: String,
    public_id: String,
    format: String
  },
  // For Audiobooks (Chapters)
  chapters: [{
    title: String,
    url: String,
    public_id: String,
    isSample: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  order: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Book', BookSchema);
