const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: process.env.GCS_KEYFILE,
  projectId: process.env.GCS_PROJECT_ID,
});

const bucketName = process.env.GCS_BUCKET_NAME;

/**
 * Uploads a file to the Google Cloud Storage bucket.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} originalname - The original name of the file.
 * @param {string} mimetype - The MIME type of the file.
 * @param {string} [folder='profile-pictures'] - The folder within the bucket to upload to.
 * @returns {Promise<string>} - A promise that resolves to the public URL of the uploaded file.
 */
const uploadFile = (fileBuffer, originalname, mimetype, folder = 'profile-pictures') => {
  return new Promise((resolve, reject) => {
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(`${folder}/${Date.now()}_${originalname}`);
    
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: mimetype,
      },
      resumable: false,
    });

    blobStream.on('error', (err) => {
      console.error("Error uploading to GCS:", err);
      reject(new Error('Failed to upload file to GCS.'));
    });

    blobStream.on('finish', async () => {
      try {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        console.log("Successfully uploaded to GCS:", publicUrl);
        resolve(publicUrl);
      } catch (err) {
        console.error("Error generating public URL:", err);
        reject(new Error('Failed to generate public URL for GCS file.'));
      }
    });

    blobStream.end(fileBuffer);
  });
};

/**
 * Deletes a file from the Google Cloud Storage bucket.
 * @param {string} fileUrl - The URL of the file to delete.
 * @returns {Promise<void>} - A promise that resolves when the file is deleted.
 */
const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.startsWith('https://storage.googleapis.com/')) {
      console.log("Skipping deletion: Not a valid GCS URL.", fileUrl);
      return;
    }
    const urlParts = new URL(fileUrl);
    const bucket = storage.bucket(bucketName);
    const fileName = urlParts.pathname.substring(1).replace(`${bucketName}/`, '');
    await bucket.file(fileName).delete();
    console.log(`Successfully deleted from GCS: ${fileName}`);
  } catch (error) {
    console.error("Error deleting from GCS (this may be expected if file is already gone):", error.message);
  }
};

module.exports = {
  uploadFile,
  deleteFile,
}; 