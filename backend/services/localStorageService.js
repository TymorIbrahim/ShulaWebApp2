const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * Uploads a file to local storage.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} originalname - The original name of the file.
 * @param {string} mimetype - The MIME type of the file.
 * @param {string} [folder='profile-pictures'] - The folder to upload to.
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded file.
 */
const uploadFile = async (fileBuffer, originalname, mimetype, folder = 'profile-pictures') => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '..', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(originalname);
    const filename = `${timestamp}_${uniqueSuffix}${ext}`;
    
    // Write file to disk
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, fileBuffer);
    
    // Return URL path (will be served by Express static middleware)
    const publicUrl = `/uploads/${folder}/${filename}`;
    console.log("Successfully uploaded to local storage:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to local storage:", error);
    throw new Error('Failed to upload file to local storage.');
  }
};

/**
 * Deletes a file from local storage.
 * @param {string} fileUrl - The URL of the file to delete.
 * @returns {Promise<void>} - A promise that resolves when the file is deleted.
 */
const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      console.log("Skipping deletion: Not a local storage URL.", fileUrl);
      return;
    }
    
    // Extract path from URL
    const relativePath = fileUrl.substring(1); // Remove leading slash
    const filePath = path.join(__dirname, '..', relativePath);
    
    // Check if file exists before deleting
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`Successfully deleted from local storage: ${fileUrl}`);
    } catch (error) {
      console.log(`File not found for deletion: ${fileUrl}`);
    }
  } catch (error) {
    console.error("Error deleting from local storage:", error);
  }
};

module.exports = {
  uploadFile,
  deleteFile,
}; 