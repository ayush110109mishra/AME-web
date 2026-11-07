const Announcement = require('../models/Announcement');

// @desc    Get announcements with targetYear filtering and pagination
// @route   GET /api/announcements
// @access  Protected (Students see targetYear 0 or their year; Admins see all)
exports.getAnnouncements = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {};

    // Security Rule: Students only see announcements for All Years (0) or their academic year
    if (req.user.role !== 'admin') {
      const studentYear = Number(req.user.year) || 1;
      query.targetYear = { $in: [0, studentYear] };
    } else if (req.query.targetYear !== undefined && req.query.targetYear !== '') {
      // Admin can optionally filter by targetYear
      query.targetYear = Number(req.query.targetYear);
    }

    // Category filter
    if (req.query.category && req.query.category.trim() !== '') {
      query.category = req.query.category.trim().toLowerCase();
    }

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email rollNo')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Announcements retrieved successfully',
      data: {
        announcements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Protected + Admin only
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, category, targetYear } = req.body;

    const announcement = await Announcement.create({
      title: title.trim(),
      description: description.trim(),
      category: category ? category.toLowerCase().trim() : 'general',
      targetYear: targetYear !== undefined ? Number(targetYear) : 0,
      createdBy: req.user._id,
    });

    await announcement.populate('createdBy', 'name email rollNo');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing announcement
// @route   PUT /api/announcements/:id
// @access  Protected + Admin only
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, targetYear } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
        data: null,
      });
    }

    if (title !== undefined) announcement.title = title.trim();
    if (description !== undefined) announcement.description = description.trim();
    if (category !== undefined) announcement.category = category.toLowerCase().trim();
    if (targetYear !== undefined) announcement.targetYear = Number(targetYear);

    await announcement.save();
    await announcement.populate('createdBy', 'name email rollNo');

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Protected + Admin only
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
        data: null,
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

