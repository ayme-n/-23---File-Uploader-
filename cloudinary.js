const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require("dotenv").config();
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUD,
  api_secret: process.env.API_SECRET_CLOUD,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder: 'uploads',
      resource_type: isImage ? 'image' : 'raw',
      public_id: file.originalname.split('.').slice(0, -1).join('.'), // Optional: readable name
      format: file.mimetype.split('/')[1], // ensure format is set correctly
    };
  },
});

const upload = multer({ storage });

module.exports = { upload };
