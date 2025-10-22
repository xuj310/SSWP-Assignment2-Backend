require("dotenv").config();
const admin = require("firebase-admin");
// Initialize Firebase Admin SDK

let db;
const serviceAccount = require("./serviceAccountKey.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin initialized successfully");
  db = admin.firestore();

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
  console.error("Firebase Admin initialization failed: ", error);
}

module.exports = { db };