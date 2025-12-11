import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * File Upload Service for handling various file uploads
 */
export class FileUploadService {
  
  /**
   * Upload candidate photo
   * @param {File} file - The image file to upload
   * @param {string} candidateId - The candidate ID
   * @param {string} electionId - The election ID (default: 'current')
   * @returns {Promise<string>} - The download URL of the uploaded file
   */
  static async uploadCandidatePhoto(file, candidateId, electionId = 'current') {
    try {
      // Validate file
      this.validateImageFile(file);
      
      // Create storage reference
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `candidate_photos/${electionId}/${candidateId}/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading candidate photo:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  }

  /**
   * Upload verification document
   * @param {File} file - The document file to upload
   * @param {string} voterId - The voter ID
   * @returns {Promise<string>} - The download URL of the uploaded file
   */
  static async uploadVerificationDocument(file, voterId) {
    try {
      // Validate file
      this.validateDocumentFile(file);
      
      // Create storage reference
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `verification_docs/${voterId}/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading verification document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Upload announcement attachment
   * @param {File} file - The file to upload
   * @param {string} announcementId - The announcement ID
   * @returns {Promise<string>} - The download URL of the uploaded file
   */
  static async uploadAnnouncementAttachment(file, announcementId) {
    try {
      // Validate file
      this.validateAttachmentFile(file);
      
      // Create storage reference
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `announcement_attachments/${announcementId}/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading announcement attachment:', error);
      throw new Error(`Failed to upload attachment: ${error.message}`);
    }
  }

  /**
   * Delete file from storage
   * @param {string} fileUrl - The download URL of the file to delete
   */
  static async deleteFile(fileUrl) {
    try {
      if (!fileUrl) return;
      
      // Create reference from URL
      const fileRef = ref(storage, fileUrl);
      
      // Delete file
      await deleteObject(fileRef);
      
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw error for delete operations to avoid breaking the flow
    }
  }

  /**
   * Validate image file
   * @param {File} file - The file to validate
   */
  static validateImageFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!file) {
      throw new Error('No file selected');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
    }
  }

  /**
   * Validate document file
   * @param {File} file - The file to validate
   */
  static validateDocumentFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!file) {
      throw new Error('No file selected');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF, images, and Word documents are allowed');
    }
  }

  /**
   * Validate attachment file
   * @param {File} file - The file to validate
   */
  static validateAttachmentFile(file) {
    const maxSize = 25 * 1024 * 1024; // 25MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ];
    
    if (!file) {
      throw new Error('No file selected');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 25MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported');
    }
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from filename
   * @param {string} filename - The filename
   * @returns {string} - File extension
   */
  static getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }
}

export default FileUploadService;