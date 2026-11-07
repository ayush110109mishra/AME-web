const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a memory buffer directly to Cloudinary via upload_stream
 * @param {Buffer} fileBuffer
 * @param {Object} options
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadStream = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'ame/gallery',
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(fileBuffer);
  });
};

/**
 * Delete an asset from Cloudinary
 * @param {string} publicId
 * @returns {Promise<any>}
 */
const deleteAsset = async (publicId) => {
  if (!publicId) return;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary asset deletion error:', error.message);
  }
};

module.exports = {
  cloudinary,
  uploadStream,
  deleteAsset,
};

