const multer = require('multer');

// Store uploaded files in memory buffers to pipe directly into Cloudinary upload_stream
const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
  },
});

// Middleware wrapper to return clean JSON error responses for Multer errors
const handleUploadError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Image file size cannot exceed 5 MB',
            data: null,
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'You can upload a maximum of 10 images at once',
            data: null,
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
          data: null,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          data: null,
        });
      }
      next();
    });
  };
};

module.exports = {
  upload,
  handleUploadError,
};

