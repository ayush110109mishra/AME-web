/**
 * Cloudinary Responsive Transformation Helpers
 * Automatically formats to modern WebP/AVIF (f_auto) and adjusts quality (q_auto)
 */
export const getOptimizedImageUrl = (url, width = 400) => {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('res.cloudinary.com') || url.includes('/upload/w_')) return url;

  return url.replace('/upload/', `/upload/w_${width},c_fill,f_auto,q_auto/`);
};

export const getLightboxImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('res.cloudinary.com') || url.includes('/upload/w_')) return url;

  return url.replace('/upload/', '/upload/w_1200,c_limit,f_auto,q_auto/');
};

