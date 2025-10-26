require("dotenv").config();
const admin = require("firebase-admin");
const cloudinary = require("cloudinary").v2;
// Initialize Firebase Admin SDK

let db;
let cloudUploader;
const serviceAccount = require("./serviceAccountKey.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin initialized successfully");
  db = admin.firestore();

  // Configure Cloudinary with credentials
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Initialise cloudinary admin & uploader services
  cloudUploader = cloudinary.uploader;

  // Test Cloudinary upload
  cloudUploader
    .upload("./uploads/test", { folder: "test-uploads" })
    .then((result) => {
      console.log("✅ Cloudinary upload successful:");
      console.log("URL:", result.secure_url);
    })
    .catch((error) => {
      console.error("❌ Cloudinary upload failed:", error.message);
    });

  db.listCollections()
    .then((collections) => {
      console.log(
        "Firestore is working. Collections:",
        collections.map((c) => c.id)
      );
    })
    .catch((error) => {
      console.error("Firestore connection failed:", error.message);
    });
} catch (error) {
  console.error("Database initialization failed: ", error);
}

module.exports = { db, cloudUploader };
