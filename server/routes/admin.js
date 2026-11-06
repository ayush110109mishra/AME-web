const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

// @desc    Get dashboard metrics & stats for Admin
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, isAdmin, async (req, res, next) => {
  try {
    const [
      totalMembers,
      totalStudents,
      totalAdmins,
      year1,
      year2,
      year3,
      year4,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ year: 1 }),
      User.countDocuments({ year: 2 }),
      User.countDocuments({ year: 3 }),
      User.countDocuments({ year: 4 }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard statistics fetched successfully',
      data: {
        totalMembers,
        totalStudents,
        totalAdmins,
        yearWise: {
          year1,
          year2,
          year3,
          year4,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all students / members with filtering, search, and pagination
// @route   GET /api/admin/students
// @access  Private/Admin
router.get('/students', protect, isAdmin, async (req, res, next) => {
  try {
    const { year, semester, search, role, page = 1, limit = 10 } = req.query;

    const query = {};

    if (role && ['student', 'admin'].includes(role)) {
      query.role = role;
    }

    if (year) {
      query.year = Number(year);
    }

    if (semester) {
      query.semester = Number(semester);
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { rollNo: searchRegex },
        { email: searchRegex },
      ];
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (currentPage - 1) * pageLimit;

    const [total, students] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
    ]);

    const totalPages = Math.ceil(total / pageLimit) || 1;

    return res.status(200).json({
      success: true,
      message: 'Students list fetched successfully',
      data: {
        students,
        pagination: {
          total,
          pages: totalPages,
          page: currentPage,
          limit: pageLimit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user role (promote to admin or demote to student)
// @route   PUT /api/admin/students/:id/role
// @access  Private/Admin
router.put('/students/:id/role', protect, isAdmin, async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    if (!role || !['admin', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "admin" or "student"',
        data: null,
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        data: null,
      });
    }

    // Rule 1: Admin cannot change/demote their own role
    if (req.user._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot change their own role',
        data: null,
      });
    }

    // Rule 2: Cannot demote the last remaining admin
    if (targetUser.role === 'admin' && role === 'student') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the last remaining administrator',
          data: null,
        });
      }
    }

    targetUser.role = role;
    await targetUser.save();

    const sanitizedUser = targetUser.toObject();
    delete sanitizedUser.password;

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        user: sanitizedUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Export students as CSV file (without external libraries)
// @route   GET /api/admin/students/export
// @access  Private/Admin
router.get('/students/export', protect, isAdmin, async (req, res, next) => {
  try {
    const students = await User.find({})
      .select('-password')
      .sort({ rollNo: 1 });

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Name',
      'Roll Number',
      'College',
      'Branch',
      'Year',
      'Semester',
      'Email',
      'Mobile',
      'Role',
      'Registration Date',
    ];

    const rows = students.map((s) => [
      escapeCsv(s.name),
      escapeCsv(s.rollNo),
      escapeCsv(s.college),
      escapeCsv(s.branch),
      escapeCsv(s.year),
      escapeCsv(s.semester),
      escapeCsv(s.email),
      escapeCsv(s.mobile),
      escapeCsv(s.role),
      escapeCsv(s.createdAt ? s.createdAt.toISOString() : ''),
    ]);

    const csvContent = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="ame_students_export.csv"'
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
