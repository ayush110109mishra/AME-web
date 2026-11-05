const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

const router = express.Router();

// @desc    Get all students with filtering, search, and pagination
// @route   GET /api/admin/students
// @access  Private/Admin
router.get('/students', protect, isAdmin, async (req, res, next) => {
  try {
    const { year, semester, search, page = 1, limit = 10 } = req.query;

    const query = { role: 'student' };

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

// @desc    Export students as CSV file (without external libraries)
// @route   GET /api/admin/students/export
// @access  Private/Admin
router.get('/students/export', protect, isAdmin, async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
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

