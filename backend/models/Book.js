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
  coverImage: {
    url: String,
    public_id: String
  },
  // For eBooks (PDF)
  fileUrl: {
    url: String,
    public_id: String
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
  }
});

module.exports = mongoose.model('Book', BookSchema);
