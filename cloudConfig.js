const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Resolve Cloudinary settings from multiple environment variable patterns
let cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
let apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUD_API_KEY;
let apiSecret =
  process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_API_SECRET;

// If a CLOUDINARY_URL is present, parse values from it: cloudinary://key:secret@cloud_name
if (process.env.CLOUDINARY_URL) {
  const m = process.env.CLOUDINARY_URL.match(
    /^cloudinary:\/\/([^:]+):([^@]+)@([^/\s]+)\/?.*$/,
  );
  if (m) {
    apiKey = apiKey || m[1];
    apiSecret = apiSecret || m[2];
    cloudName = cloudName || m[3];
  }
}

if (!cloudName) {
  console.error(
    "Missing Cloudinary cloud name. Set CLOUDINARY_CLOUD_NAME or CLOUD_NAME in your environment.",
  );
  throw new Error(
    "Missing Cloudinary cloud name. Set CLOUDINARY_CLOUD_NAME or CLOUD_NAME in .env",
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Wanderlust_DEV",
    allowedFormats: ["png", "jpg", "jpeg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};
