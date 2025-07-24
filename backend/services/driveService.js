const { google } = require('googleapis');
const stream = require('stream');
require('dotenv').config();

// Configure Google Drive API client
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_API_KEYFILE,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });
const profilePicturesFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

/**
 * Uploads a file to a specific folder in Google Drive.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} originalname - The original name of the file.
 * @param {string} mimetype - The MIME type of the file.
 * @returns {Promise<string>} - A promise that resolves to the web view link of the uploaded file.
 */
const uploadFile = async (fileBuffer, originalname, mimetype) => {
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const { data } = await drive.files.create({
      media: {
        mimeType: mimetype,
        body: bufferStream,
      },
      requestBody: {
        name: `${Date.now()}_${originalname}`,
        parents: [profilePicturesFolderId],
      },
      fields: 'id, webViewLink',
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log("Successfully uploaded to Google Drive:", data.webViewLink);
    return data.webViewLink;
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw new Error('Failed to upload file to Google Drive.');
  }
};

/**
 * Deletes a file from Google Drive.
 * @param {string} fileUrl - The web view link of the file to delete.
 * @returns {Promise<void>} - A promise that resolves when the file is deleted.
 */
const deleteFile = async (fileUrl) => {
  try {
    // First, validate if it's a proper Google Drive URL before attempting deletion.
    if (!fileUrl || !fileUrl.includes('drive.google.com')) {
      console.log("Skipping deletion: Not a valid Google Drive URL.", fileUrl);
      return;
    }

    // Extract the file ID from the URL
    const match = fileUrl.match(/d\/(.*?)\//);
    if (!match || !match[1]) {
      console.warn("Could not extract file ID from Google Drive URL:", fileUrl);
      return;
    }
    const fileId = match[1];

    await drive.files.delete({ fileId });
    console.log(`Successfully deleted from Google Drive: ${fileId}`);
  } catch (error) {
    console.error("Error deleting from Google Drive (this may be expected if file is already gone):", error.message);
    // Continue gracefully without throwing an error to prevent blocking new uploads.
  }
};

module.exports = {
  uploadFile,
  deleteFile,
}; 