const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getClubStats,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Rate limiter: 20 requests per 15 minutes for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    data: null,
  },
});

// Register validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('rollNo')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Roll number is required'),
  body('college').trim().notEmpty().withMessage('College name is required'),
  body('branch').optional().trim(),
  body('year')
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be a number between 1 and 4'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be a number between 1 and 8'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('mobile')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
];

// Login validation rules
const loginValidation = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or Roll number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Profile update validation rules
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('college')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('College cannot be empty'),
  body('branch').optional().trim(),
  body('year')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('mobile')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be 10 digits'),
];

// Change password validation rules
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('New password must contain at least one letter and one number'),
];

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.put(
  '/change-password',
  protect,
  changePasswordValidation,
  changePassword
);
router.get('/stats', protect, getClubStats);

module.exports = router;

