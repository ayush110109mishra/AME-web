const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getAlbums,
  getAlbumById,
  createAlbum,
  uploadPhotos,
  updateAlbum,
  deletePhoto,
  deleteAlbum,
} = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Rate limiter for upload operations to prevent quota exhaustion
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached. Please wait a few minutes before uploading more images.',
    data: null,
  },
});

// Public gallery viewing for authenticated students & admins
router.get('/', protect, getAlbums);
router.get('/:id', protect, getAlbumById);

// Admin-only management endpoints
router.post(
  '/',
  protect,
  isAdmin,
  uploadLimiter,
  handleUploadError(upload.single('coverImage')),
  createAlbum
);

router.post(
  '/:id/images',
  protect,
  isAdmin,
  uploadLimiter,
  handleUploadError(upload.array('images', 10)),
  uploadPhotos
);

router.put(
  '/:id',
  protect,
  isAdmin,
  uploadLimiter,
  handleUploadError(upload.single('coverImage')),
  updateAlbum
);

router.delete('/:id/images/:publicId', protect, isAdmin, deletePhoto);
router.delete('/:id', protect, isAdmin, deleteAlbum);

module.exports = router;

