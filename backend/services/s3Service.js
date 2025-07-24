const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET_NAME;

/**
 * Uploads a file to the S3 bucket.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} originalname - The original name of the file.
 * @param {string} mimetype - The MIME type of the file.
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded file.
 */
const uploadFile = (fileBuffer, originalname, mimetype) => {
  return new Promise((resolve, reject) => {
    const key = `profile-pictures/${Date.now()}_${originalname}`;
    
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
      ACL: 'public-read' // Make the file publicly accessible
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error uploading to S3:", err);
        return reject(new Error('Failed to upload file to S3.'));
      }
      console.log("Successfully uploaded to S3:", data.Location);
      resolve(data.Location); // The public URL of the file
    });
  });
};

/**
 * Deletes a file from the S3 bucket.
 * @param {string} fileUrl - The URL of the file to delete.
 * @returns {Promise<void>} - A promise that resolves when the file is deleted.
 */
const deleteFile = (fileUrl) => {
  return new Promise((resolve, reject) => {
    try {
      const key = fileUrl.split('/').pop(); // Extract the key from the URL
      
      const params = {
        Bucket: bucketName,
        Key: `profile-pictures/${key}`
      };

      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error("Error deleting from S3:", err);
          return reject(new Error('Failed to delete file from S3.'));
        }
        console.log("Successfully deleted from S3:", key);
        resolve();
      });
    } catch (error) {
      console.error("Error parsing S3 file URL for deletion:", error);
      reject(new Error("Invalid file URL for S3 deletion."));
    }
  });
};

module.exports = {
  uploadFile,
  deleteFile
}; 