require("dotenv").config();
const express = require('express');
const { db } = require("./config/db");
const app = express();
const PORT = 3000;
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const helmet = require("helmet");
const cors = require("cors");

// Middleware
app.use(express.json());
// Enable CORS
app.use(cors());
// Use Helmet Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", userRoutes);
app.use("/api", productRoutes);

// Global error handler. Such as if invalid json is passed in
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// // Test endpoint to fetch all documents from 'test' collection
// app.get('/test', async (req, res) => {
//   try {
//     const snapshot = await admin.collection('test').get();
//     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Root endpoint
app.get('/', (req, res) => {
  res.send('Firestore API is running');
});


const port = process.env.PORT || 3000;
// Start server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
