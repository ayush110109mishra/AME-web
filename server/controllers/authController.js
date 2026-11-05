const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        data: { errors: errors.array() },
      });
    }

    const {
      name,
      rollNo,
      college,
      branch,
      year,
      semester,
      email,
      mobile,
      password,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRollNo = rollNo.toUpperCase().trim();

    // Check duplicate email or roll number
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
        data: null,
      });
    }

    const existingRoll = await User.findOne({ rollNo: normalizedRollNo });
    if (existingRoll) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is already registered',
        data: null,
      });
    }

    // Role is ALWAYS forced to "student"
    const user = await User.create({
      name: name.trim(),
      rollNo: normalizedRollNo,
      college: college.trim(),
      branch: (branch && branch.trim()) || 'Mechanical Engineering',
      year: Number(year),
      semester: Number(semester),
      email: normalizedEmail,
      mobile: mobile.trim(),
      password,
      role: 'student',
    });

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: userObj,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user via email or roll number
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        data: { errors: errors.array() },
      });
    }

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
        data: null,
      });
    }

    const cleanIdentifier = identifier.trim();

    // Find by email (case-insensitive) OR rollNo (uppercase)
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { rollNo: cleanIdentifier.toUpperCase() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        data: null,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        data: null,
      });
    }

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userObj,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User profile fetched',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (restricted fields: name, college, year, semester, mobile)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        data: { errors: errors.array() },
      });
    }

    const { name, college, year, semester, mobile } = req.body;

    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = name.trim();
    if (college !== undefined) allowedUpdates.college = college.trim();
    if (year !== undefined) allowedUpdates.year = Number(year);
    if (semester !== undefined) allowedUpdates.semester = Number(semester);
    if (mobile !== undefined) allowedUpdates.mobile = mobile.trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: allowedUpdates },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};

