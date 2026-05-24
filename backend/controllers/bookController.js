const path = require('path');
const Book = require('../models/Book');
const User = require('../models/User');
const Review = require('../models/Review');
const { cloudinary } = require('../utils/cloudinary');

// Create a new book (Admin only)
exports.createBook = async (req, res) => {
  try {
    const { title, description, author, type, price, comingSoon } = req.body;
    
    const newBook = new Book({
      title,
      description,
      author,
      type,
      price,
      comingSoon: comingSoon === 'true' // Handle form data string
    });

    // Handle cover image if uploaded
    if (req.files && req.files.coverImage) {
      newBook.coverImage = {
        url: req.files.coverImage[0].path,
        public_id: req.files.coverImage[0].filename
      };
    }

    // Handle eBook file if uploaded and not coming soon
    if (!newBook.comingSoon && type === 'ebook' && req.files && req.files.bookFile) {
      const originalFile = req.files.bookFile[0];
      const extension = path.extname(originalFile.originalname).toLowerCase().replace('.', '');
      
      newBook.fileUrl = {
        url: originalFile.path,
        public_id: originalFile.filename,
        format: extension // 'pdf', 'epub', etc.
      };

      newBook.ebookFiles = [{
        title: originalFile.originalname,
        url: originalFile.path,
        public_id: originalFile.filename,
        format: extension,
        isSample: false,
        order: 0
      }];
    }

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Add chapter to Audiobook (Admin only)
exports.addChapter = async (req, res) => {
  try {
    const { bookId, title, isSample } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ msg: 'Book not found' });

    if (!req.file) return res.status(400).json({ msg: 'Please upload an audio file' });

    const newChapter = {
      title,
      url: req.file.path,
      public_id: req.file.filename,
      isSample: isSample === 'true'
    };

    book.chapters.push(newChapter);
    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addEbookFile = async (req, res) => {
  try {
    const { bookId, title, isSample } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ msg: 'Book not found' });
    if (book.type !== 'ebook') return res.status(400).json({ msg: 'This route only supports eBook files' });
    if (!req.file) return res.status(400).json({ msg: 'Please upload an ebook file' });

    const originalFile = req.file.originalname;
    const extension = path.extname(originalFile).toLowerCase().replace('.', '');

    const newEbookFile = {
      title: title || originalFile,
      url: req.file.path,
      public_id: req.file.filename,
      format: extension,
      isSample: isSample === 'true',
      order: book.ebookFiles ? book.ebookFiles.length : 0
    };

    book.ebookFiles = book.ebookFiles || [];
    book.ebookFiles.push(newEbookFile);
    await book.save();

    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateEbookFile = async (req, res) => {
  try {
    const { bookId, fileId } = req.params;
    const { title, isSample } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ msg: 'Book not found' });
    if (book.type !== 'ebook') return res.status(400).json({ msg: 'This route only supports eBook files' });

    book.ebookFiles = book.ebookFiles || [];
    const file = book.ebookFiles.id(fileId);
    if (!file) return res.status(404).json({ msg: 'eBook file not found' });

    if (title) file.title = title;
    if (typeof isSample !== 'undefined') file.isSample = isSample === 'true' || isSample === true;
    if (req.file) {
      const extension = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      file.url = req.file.path;
      file.public_id = req.file.filename;
      file.format = extension;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteEbookFile = async (req, res) => {
  try {
    const { bookId, fileId } = req.params;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ msg: 'Book not found' });
    if (book.type !== 'ebook') return res.status(400).json({ msg: 'This route only supports eBook files' });

    book.ebookFiles = book.ebookFiles || [];
    const file = book.ebookFiles.id(fileId);
    if (!file) return res.status(404).json({ msg: 'eBook file not found' });

    file.remove();
    book.markModified('ebookFiles');
    await book.save();

    res.json({ msg: 'eBook file removed successfully', ebookFiles: book.ebookFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all books (Public)
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.aggregate([
      { $sort: { order: 1, createdAt: -1 } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'bookId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          avgRating: { $avg: '$reviews.rating' },
          reviewCount: { $size: '$reviews' }
        }
      },
      {
        $project: {
          'chapters.url': 0,
          'fileUrl.url': 0,
          'reviews': 0
        }
      }
    ]);
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get specific book details (Private - depends on purchase)
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    // Check if user has purchased the book or is an admin (Skip if user is disabled)
    let isPurchased = false;
    if (req.user && !req.user.disabled) {
      if (req.user.role === 'admin') {
        isPurchased = true;
      } else {
        const user = await User.findById(req.user.id);
        isPurchased = user && (user.allAccess || user.purchasedItems.some(id => id.toString() === book._id.toString()));
      }
    }

    const bookData = book.toObject();
    bookData.ebookFiles = bookData.ebookFiles || [];

    if (!isPurchased) {
      if (book.type === 'ebook') {
        bookData.ebookFiles = bookData.ebookFiles.filter(file => file.isSample);
        delete bookData.fileUrl;
      }
      if (book.type === 'audiobook') {
        // Completely hide non-sample chapters for unpurchased users
        bookData.chapters = bookData.chapters.filter(ch => ch.isSample);
      }
    }

    if (bookData.type === 'ebook' && bookData.ebookFiles.length > 0) {
      delete bookData.fileUrl;
    }

    res.json(bookData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Reorder Chapters / eBook files (Admin only)
exports.reorderChapters = async (req, res) => {
  try {
    const { bookId, chapters, ebookFiles } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ msg: 'Book not found' });

    if (Array.isArray(chapters)) {
      book.chapters = chapters.map(ch => ({
        _id: ch._id,
        title: ch.title,
        url: ch.url,
        public_id: ch.public_id,
        isSample: Boolean(ch.isSample)
      }));
      book.markModified('chapters');
      await book.save();
      return res.json({ msg: 'Chapters reordered successfully', chapters: book.chapters });
    }

    if (Array.isArray(ebookFiles)) {
      book.ebookFiles = ebookFiles.map(file => ({
        _id: file._id,
        title: file.title,
        url: file.url,
        public_id: file.public_id,
        format: file.format,
        isSample: Boolean(file.isSample),
        order: file.order || 0
      }));
      book.markModified('ebookFiles');
      await book.save();
      return res.json({ msg: 'eBook files reordered successfully', ebookFiles: book.ebookFiles });
    }

    return res.status(400).json({ msg: 'Please provide chapters or ebookFiles to reorder' });
  } catch (err) {
    console.error('Reorder Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Update Book details (Admin only)
exports.updateBook = async (req, res) => {
  try {
    const { title, description, price, author } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ msg: 'Book not found' });

    if (title) book.title = title;
    if (description) book.description = description;
    if (price) book.price = price;
    if (author) book.author = author;

    if (req.file) {
      book.coverImage = {
        url: req.file.path,
        public_id: req.file.filename
      };
    }

    await book.save();
    res.json({ msg: 'Book updated successfully', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while updating book' });
  }
};

// Add a review to a book
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({ msg: 'Please provide a rating and a comment' });
    }

    const review = new Review({
      bookId,
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while adding review' });
  }
};

// Get all reviews for a book
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching reviews' });
  }
};

// Delete a review (Admin only)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ msg: 'Review not found' });

    // Ensure the user is an admin (already handled by middleware, but good to double check)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only admins can delete reviews' });
    }

    await review.deleteOne();
    res.json({ msg: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while deleting review' });
  }
};

// Reorder Books (Admin only)
exports.reorderBooks = async (req, res) => {
  try {
    const { books } = req.body; // Expects array of { _id, order }
    
    if (!Array.isArray(books)) {
      return res.status(400).json({ msg: 'Invalid books array' });
    }

    const updatePromises = books.map(b => 
      Book.findByIdAndUpdate(b._id, { order: b.order })
    );

    await Promise.all(updatePromises);

    res.json({ msg: 'Books reordered successfully' });
  } catch (err) {
    console.error('Reorder Books Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
