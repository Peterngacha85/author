const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

if (process.env.CLOUDINARY_URL) {
  // If CLOUDINARY_URL is provided, use it directly (auto-configures)
  console.log('Using Cloudinary URL configuration');
} else {
  console.log('Cloudinary Config Check:', {
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    has_secret: !!process.env.CLOUDINARY_API_SECRET
  });

  cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim()
  });
}

const path = require('path');

// Unified dynamic storage for Books (Covers and Files)
const bookStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    let resource_type = 'image';
    let folder = process.env.CLOUDINARY_COVERS_FOLDER || 'author_system/covers';

    // If it's a PDF or other non-image file, use 'raw'
    if (['.pdf', '.epub', '.mobi'].includes(ext)) {
      resource_type = 'raw';
      folder = process.env.CLOUDINARY_EBOOKS_FOLDER || 'author_system/ebooks';
    } else if (['.mp3', '.wav', '.m4a'].includes(ext)) {
      resource_type = 'video'; // Cloudinary resource_type for audio is 'video'
      folder = process.env.CLOUDINARY_AUDIO_FOLDER || 'author_system/audio';
    }

    const fileName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const public_id = `${Date.now()}-${fileName}`;

    return {
      folder,
      resource_type,
      public_id
    };
  }
});

// Storage for Audiobooks (MP3s) - Keeping separate as well for addChapter
const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_AUDIO_FOLDER || 'author_system/audio',
    resource_type: 'auto'
  }
});

// Storage for Profile Photos
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.CLOUDINARY_PROFILES_FOLDER || 'author_system/profiles',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

const uploadBook = multer({ storage: bookStorage });
const uploadAudio = multer({ storage: audioStorage });
const uploadProfile = multer({ storage: profileStorage });

module.exports = {
  cloudinary,
  uploadBook,
  uploadAudio,
  uploadProfile
};
