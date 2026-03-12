const Book = require('../models/Book');
const User = require('../models/User');
const { cloudinary } = require('../utils/cloudinary');

// Create a new book (Admin only)
exports.createBook = async (req, res) => {
  try {
    const { title, description, author, type, price } = req.body;
    
    const newBook = new Book({
      title,
      description,
      author,
      type,
      price
    });

    // Handle cover image if uploaded
    if (req.files && req.files.coverImage) {
      newBook.coverImage = {
        url: req.files.coverImage[0].path,
        public_id: req.files.coverImage[0].filename
      };
    }

    // Handle eBook file if uploaded
    if (type === 'ebook' && req.files && req.files.bookFile) {
      newBook.fileUrl = {
        url: req.files.bookFile[0].path,
        public_id: req.files.bookFile[0].filename
      };
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
    if (book.type !== 'audiobook') return res.status(400).json({ msg: 'Not an audiobook' });

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

// Get all books (Public)
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().select('-chapters.url -fileUrl.url'); // Exclude secure URLs by default
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

    // Check if user has purchased the book or is an admin
    let isPurchased = false;
    if (req.user) {
      if (req.user.role === 'admin') {
        isPurchased = true;
      } else {
        const user = await User.findById(req.user.id);
        isPurchased = user && user.purchasedItems.some(id => id.toString() === book._id.toString());
      }
    }

    const bookData = book.toObject();
    
    if (!isPurchased) {
      if (book.type === 'ebook') {
        delete bookData.fileUrl;
      }
      if (book.type === 'audiobook') {
        bookData.chapters = bookData.chapters.map(ch => {
          if (!ch.isSample) {
            const { url, ...rest } = ch;
            return rest;
          }
          return ch;
        });
      }
    }

    res.json(bookData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
