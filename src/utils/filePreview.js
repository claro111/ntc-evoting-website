/**
 * Utility functions for file preview and type detection
 */

/**
 * Get file type from URL or filename
 * @param {string} url - File URL or filename
 * @returns {string} - File type category
 */
export const getFileType = (url) => {
  if (!url) return 'unknown';
  
  const extension = url.toLowerCase().split('.').pop().split('?')[0];
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const videoTypes = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
  const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
  const documentTypes = ['pdf'];
  const textTypes = ['txt', 'md'];
  const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (videoTypes.includes(extension)) return 'video';
  if (audioTypes.includes(extension)) return 'audio';
  if (documentTypes.includes(extension)) return 'pdf';
  if (textTypes.includes(extension)) return 'text';
  if (officeTypes.includes(extension)) return 'office';
  if (archiveTypes.includes(extension)) return 'archive';
  
  return 'unknown';
};

/**
 * Get file icon based on file type
 * @param {string} fileType - File type from getFileType
 * @returns {string} - Emoji icon
 */
export const getFileIcon = (fileType) => {
  const icons = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    pdf: '📄',
    text: '📝',
    office: '📊',
    archive: '📦',
    unknown: '📎'
  };
  
  return icons[fileType] || icons.unknown;
};

/**
 * Check if file can be previewed inline
 * @param {string} fileType - File type from getFileType
 * @returns {boolean} - Whether file can be previewed
 */
export const canPreviewInline = (fileType) => {
  return ['image', 'video', 'audio', 'pdf'].includes(fileType);
};

/**
 * Get file size from bytes
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extract filename from URL
 * @param {string} url - File URL
 * @returns {string} - Filename
 */
export const getFilenameFromUrl = (url) => {
  if (!url) return 'Unknown file';
  
  try {
    // Extract filename from Firebase Storage URL
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    const filename = lastPart.split('?')[0];
    
    // Decode URL encoding
    return decodeURIComponent(filename);
  } catch (error) {
    return 'Unknown file';
  }
};