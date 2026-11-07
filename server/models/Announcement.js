const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Announcement description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['seminar', 'intro', 'workshop', 'general'],
        message: '{VALUE} is not a valid announcement category',
      },
      default: 'general',
      lowercase: true,
      trim: true,
    },
    targetYear: {
      type: Number,
      enum: {
        values: [0, 1, 2, 3, 4],
        message: 'Target year must be 0 (All Years) or between 1 and 4',
      },
      default: 0, // 0 indicates all years are eligible
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for high performance query sorting and year filtering
announcementSchema.index({ createdAt: -1, targetYear: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
