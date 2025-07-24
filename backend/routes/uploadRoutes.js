const express = require('express');
const multer = require('multer');
const authorize = require('../middleware/auth');
const User = require('../models/user.model');

// Determine which storage service to use based on environment configuration
let storageService;

if (process.env.STORAGE_SERVICE === 's3' && process.env.AWS_ACCESS_KEY_ID) {
  console.log('Using S3 storage service');
  storageService = require('../services/s3Service');
} else if (process.env.STORAGE_SERVICE === 'gcs' && process.env.GCS_BUCKET_NAME) {
  console.log('Using Google Cloud Storage service');
  storageService = require('../services/gcsService');
} else {
  console.log('Using local storage service (default)');
  storageService = require('../services/localStorageService');
}

const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

router.post('/profile-picture', authorize(['customer', 'staff']), upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If there's an old picture, delete it from GCS
    if (user.profilePic && !user.profilePic.includes('default-avatar.png')) {
      try {
        await storageService.deleteFile(user.profilePic);
      } catch (deleteError) {
        console.error("Failed to delete old profile picture from GCS, continuing with upload...", deleteError);
      }
    }

    // Upload the new picture to GCS
    const profilePicUrl = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'profile-pictures'
    );

    user.profilePic = profilePicUrl;

    // Data correction for legacy membershipType values
    if (user.membership && user.membership.membershipType === 'basic_customer') {
      console.log(`Correcting legacy membershipType for user: ${user.email}`);
      user.membership.membershipType = 'online';
    }

    await user.save();
    
    res.json({
      message: 'Profile picture updated successfully',
      user: {
        ...user.toObject(),
        profilePic: profilePicUrl
      }
    });

  } catch (error) {
    console.error("Error during profile picture upload:", error);
    res.status(500).json({ message: 'Server error while uploading profile picture.' });
  }
});

router.post('/id-document', authorize(['customer', 'staff']), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const idFileUrl = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'id-documents' // Folder name in GCS
    );

    res.json({
      message: 'ID document uploaded successfully',
      filePath: idFileUrl
    });

  } catch (error) {
    console.error("Error during ID document upload:", error);
    res.status(500).json({ message: 'Server error while uploading ID document.' });
  }
});

router.post('/signature', authorize(['customer', 'staff']), upload.single('signature'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const signatureUrl = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'signatures' // Folder name in GCS
    );

    res.json({
      message: 'Signature uploaded successfully',
      filePath: signatureUrl
    });

  } catch (error) {
    console.error("Error during signature upload:", error);
    res.status(500).json({ message: 'Server error while uploading signature.' });
  }
});

router.post('/product-image', authorize('staff'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const imageUrl = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'product-images' // Folder name in GCS
    );

    res.json({
      message: 'Product image uploaded successfully',
      filePath: imageUrl
    });

  } catch (error) {
    console.error("Error during product image upload:", error);
    res.status(500).json({ message: 'Server error while uploading product image.' });
  }
});

module.exports = router; 