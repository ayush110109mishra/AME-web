const Gallery = require('../models/Gallery');
const { uploadStream, deleteAsset } = require('../config/cloudinary');

// @desc    Get all gallery albums (summary with cover & photo count)
// @route   GET /api/gallery
// @access  Protected
exports.getAlbums = async (req, res, next) => {
  try {
    const albums = await Gallery.find()
      .sort({ eventDate: -1, createdAt: -1 })
      .select('-__v')
      .populate('createdBy', 'name email rollNo')
      .lean();

    const formatted = albums.map((album) => ({
      _id: album._id,
      eventName: album.eventName,
      description: album.description,
      eventDate: album.eventDate,
      coverImage: album.coverImage,
      photoCount: Array.isArray(album.images) ? album.images.length : 0,
      createdAt: album.createdAt,
      createdBy: album.createdBy,
    }));

    res.status(200).json({
      success: true,
      message: 'Albums retrieved successfully',
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single album by ID with all photos
// @route   GET /api/gallery/:id
// @access  Protected
exports.getAlbumById = async (req, res, next) => {
  try {
    const album = await Gallery.findById(req.params.id)
      .populate('createdBy', 'name email rollNo');

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Album retrieved successfully',
      data: album,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new album (with optional cover image upload)
// @route   POST /api/gallery
// @access  Protected + Admin only
exports.createAlbum = async (req, res, next) => {
  try {
    const { eventName, description, eventDate } = req.body;

    if (!eventName || !eventName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required',
        data: null,
      });
    }

    let coverImage = { url: '', publicId: '' };
    const images = [];

    // Optional single cover upload with album creation
    if (req.file) {
      const uploadResult = await uploadStream(req.file.buffer);
      coverImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
      images.push({
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        uploadedAt: new Date(),
      });
    }

    const album = await Gallery.create({
      eventName: eventName.trim(),
      description: description ? description.trim() : '',
      eventDate: eventDate ? new Date(eventDate) : new Date(),
      coverImage,
      images,
      createdBy: req.user._id,
    });

    await album.populate('createdBy', 'name email rollNo');

    res.status(201).json({
      success: true,
      message: 'Album created successfully',
      data: album,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple photos to an album (max 10)
// @route   POST /api/gallery/:id/images
// @access  Protected + Admin only
exports.uploadPhotos = async (req, res, next) => {
  try {
    const album = await Gallery.findById(req.params.id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found',
        data: null,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one image file to upload',
        data: null,
      });
    }

    // Upload files concurrently to Cloudinary
    const uploadPromises = req.files.map((file) => uploadStream(file.buffer));
    const uploadResults = await Promise.all(uploadPromises);

    const newPhotos = uploadResults.map((result) => ({
      url: result.url,
      publicId: result.publicId,
      uploadedAt: new Date(),
    }));

    album.images.push(...newPhotos);

    // If album doesn't have a cover image yet, assign the first uploaded photo
    if (!album.coverImage?.url && newPhotos.length > 0) {
      album.coverImage = {
        url: newPhotos[0].url,
        publicId: newPhotos[0].publicId,
      };
    }

    await album.save();

    res.status(200).json({
      success: true,
      message: `${newPhotos.length} photo(s) uploaded successfully`,
      data: album,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update album details or assign a new cover image
// @route   PUT /api/gallery/:id
// @access  Protected + Admin only
exports.updateAlbum = async (req, res, next) => {
  try {
    const album = await Gallery.findById(req.params.id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found',
        data: null,
      });
    }

    const { eventName, description, eventDate, coverPublicId } = req.body;

    if (eventName !== undefined) album.eventName = eventName.trim();
    if (description !== undefined) album.description = description.trim();
    if (eventDate !== undefined) album.eventDate = new Date(eventDate);

    // If setting an existing photo as cover
    if (coverPublicId) {
      const selectedPhoto = album.images.find(
        (img) => img.publicId === coverPublicId
      );
      if (selectedPhoto) {
        album.coverImage = {
          url: selectedPhoto.url,
          publicId: selectedPhoto.publicId,
        };
      }
    }

    // If uploading a new file specifically as cover
    if (req.file) {
      const uploadResult = await uploadStream(req.file.buffer);
      album.coverImage = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
      album.images.push({
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        uploadedAt: new Date(),
      });
    }

    await album.save();
    await album.populate('createdBy', 'name email rollNo');

    res.status(200).json({
      success: true,
      message: 'Album updated successfully',
      data: album,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a single photo from an album and Cloudinary
// @route   DELETE /api/gallery/:id/images/:photoIdOrPublicId
// @access  Protected + Admin only
exports.deletePhoto = async (req, res, next) => {
  try {
    const album = await Gallery.findById(req.params.id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found',
        data: null,
      });
    }

    const identifier = decodeURIComponent(req.params.publicId);

    // Find the photo either by subdocument _id or Cloudinary publicId
    const photo = album.images.find(
      (img) =>
        img._id.toString() === identifier ||
        img.publicId === identifier ||
        img.publicId.endsWith(identifier)
    );

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found in this album',
        data: null,
      });
    }

    // Delete from Cloudinary
    await deleteAsset(photo.publicId);

    // Remove from album images array
    album.images = album.images.filter(
      (img) => img._id.toString() !== photo._id.toString()
    );

    // If the deleted photo was the cover image, fallback to another photo
    if (album.coverImage?.publicId === photo.publicId) {
      if (album.images.length > 0) {
        album.coverImage = {
          url: album.images[0].url,
          publicId: album.images[0].publicId,
        };
      } else {
        album.coverImage = { url: '', publicId: '' };
      }
    }

    await album.save();

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully',
      data: album,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an entire album and all its Cloudinary assets
// @route   DELETE /api/gallery/:id
// @access  Protected + Admin only
exports.deleteAlbum = async (req, res, next) => {
  try {
    const album = await Gallery.findById(req.params.id);
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found',
        data: null,
      });
    }

    // Collect all publicIds to destroy in Cloudinary
    const publicIdsToDelete = new Set();
    if (album.coverImage?.publicId) {
      publicIdsToDelete.add(album.coverImage.publicId);
    }
    if (Array.isArray(album.images)) {
      album.images.forEach((img) => {
        if (img.publicId) publicIdsToDelete.add(img.publicId);
      });
    }

    // Delete assets from Cloudinary in parallel
    const deletePromises = Array.from(publicIdsToDelete).map((pid) =>
      deleteAsset(pid)
    );
    await Promise.all(deletePromises);

    // Delete album record from MongoDB
    await album.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Album and all photos deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

