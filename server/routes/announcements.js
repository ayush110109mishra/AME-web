const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

// Validation middleware helper
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      data: { errors: errors.array() },
    });
  }
  next();
};

const createAnnouncementValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Announcement title is required')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Announcement description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['seminar', 'intro', 'workshop', 'general'])
    .withMessage('Category must be seminar, intro, workshop, or general'),
  body('targetYear')
    .optional()
    .custom((val) => [0, 1, 2, 3, 4].includes(Number(val)))
    .withMessage('Target year must be 0 (All) or between 1 and 4'),
];

const updateAnnouncementValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Announcement title cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Announcement description cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['seminar', 'intro', 'workshop', 'general'])
    .withMessage('Category must be seminar, intro, workshop, or general'),
  body('targetYear')
    .optional()
    .custom((val) => [0, 1, 2, 3, 4].includes(Number(val)))
    .withMessage('Target year must be 0 (All) or between 1 and 4'),
];

// Routes
router.get('/', protect, getAnnouncements);
router.post(
  '/',
  protect,
  isAdmin,
  createAnnouncementValidation,
  handleValidationErrors,
  createAnnouncement
);
router.put(
  '/:id',
  protect,
  isAdmin,
  updateAnnouncementValidation,
  handleValidationErrors,
  updateAnnouncement
);
router.delete('/:id', protect, isAdmin, deleteAnnouncement);

module.exports = router;
