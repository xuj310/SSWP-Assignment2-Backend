const jwt = require("jsonwebtoken");
const { db } = require("../config/db");
const checkUserToken = async (req, res, next) => {
  // Extract auth token from headers
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({ errors: ["No token provided"] });
  }

  // Get the userId from te token
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    userId = decoded._id; 
  } catch (err) {
    return res.status(401).json({ errors: ["Invalid token"] });
  }

  // Check if user exists in Firestore
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return res.status(404).json({ errors: ["User not found"] });
  }

  // Check if user has role: admin
  const userData = userDoc.data();
  if (userData.role !== "admin") {
    return res.status(403).json({ errors: ["Access denied: Admins only"] });
  }
  next();
};

module.exports = checkUserToken;
