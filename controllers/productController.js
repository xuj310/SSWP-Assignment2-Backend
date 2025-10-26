const { db } = require("../config/db");
const { cloudinaryImageUpload } = require("../cloudinaryImageUploadService");
const fs = require("fs");
const path = require("path");
/* 
  Products Controller

  Logic for the CRUD operations. Some of the functions handle different sub-operations such as getProducts handling both returning all products and a specific products. By the time it's reached here, basic validations will have already occured so we just process the request and return it.
*/

exports.getProducts = async (req, res) => {
  try {
    // Store the collection reference in variable
    const productsRef = db.collection("products");

    // If an id is provided, retrieve the specific product
    if (req.query.id) {
      const productId = req.query.id;
      const productDoc = await productsRef.doc(productId).get();

      if (!productDoc.exists) {
        return res.status(404).json({ message: "Product not found" });
      }

      const productData = productDoc.data();

      return res.json({
        downloadURL: productData.downloadURL,
        id: productDoc.id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        onSale: productData.onSale,
        inStock: productData.inStock,
      });
    }

    // Apply filters if provided
    let queryRef = productsRef;

    if (req.query.onSale === "true") {
      queryRef = queryRef.where("onSale", "==", true).orderBy("price", "asc");
    } else if (req.query.inStock === "true") {
      queryRef = queryRef.where("inStock", "==", true).orderBy("price", "asc");
    } else {
      queryRef = queryRef.orderBy("price", "asc");
    }

    // Sorted products
    const snapshot = await queryRef.orderBy("title", "asc").get();

    let products = [];

    snapshot.forEach((user) => {
      products.push({
        downloadURL: user.data().downloadURL,
        id: user.id,
        title: user.data().title,
        description: user.data().description,
        price: user.data().price,
        onSale: user.data().onSale,
        inStock: user.data().inStock,
      });
    });

    // If there's no id provided, return all products
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error, error });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");

    // Extract fields from form data
    const { title, description, price, onSale, inStock } = req.body;
    const onSaleBool = onSale === "true"; // Ensure onSale is boolean
    const inStockBool = inStock === "true"; // Ensure inStock is boolean

    // Get uploaded image file from multer
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(500).json({ errors: ["No image file uploaded"] });
    }

    // Upload to Cloudinary using filename only
    const uploadResult = await cloudinaryImageUpload(imageFile.filename);

    // Delete local file if Cloudinary upload succeeded
    if (uploadResult && uploadResult.success === true) {
      const localPath = path.join("uploads", imageFile.filename);
      fs.unlink(localPath, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err.message);
        } else {
          console.log("Local file deleted:", imageFile.filename);
        }
      });
    }

    downloadURL = uploadResult.data.secure_url;

    // Store the collection reference in variable
    const productsRef = db.collection("products");

    // Create new document with auto-generated ID
    const newProductData = {
      title,
      description,
      price,
      onSale: onSaleBool,
      inStock: inStockBool,
      downloadURL,
    };
    const newProductRef = await productsRef.add(newProductData);

    // Combine ID and data into one object
    const newProduct = {
      id: newProductRef.id,
      ...newProductData,
    };

    return res.status(201).json({
      message: "Product created successfully",
      newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Extract fields from form data
    const { title, description, price, onSale, inStock } = req.body;
    const onSaleBool = onSale === "true"; // Ensure onSale is boolean

    const productId = req.query.id;
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get uploaded image file from multer
    const imageFile = req.file;
    let downloadURL;

    if (imageFile) {
      // Upload to Cloudinary using filename only
      const uploadResult = await cloudinaryImageUpload(imageFile.filename);
      downloadURL = uploadResult.data.secure_url;

      // Delete local file if Cloudinary upload succeeded
      if (uploadResult && uploadResult.success === true) {
        const localPath = path.join("uploads", imageFile.filename);
        fs.unlink(localPath, (err) => {
          if (err) {
            console.error("Failed to delete local file:", err.message);
          } else {
            console.log("Local file deleted:", imageFile.filename);
          }
        });
      }
    } else {
      // Reuse existing image if no new file is uploaded
      downloadURL = productDoc.data().downloadURL;
    }

    // Create new document with auto-generated ID
    const newProductData = {
      title,
      description,
      price,
      onSale: onSaleBool,
      inStock,
      downloadURL,
    };

    await productRef.update(newProductData);

    const updatedDoc = await productRef.get();
    const updatedProduct = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    return res.status(200).json({
      message: "Product updated successfully",
      updatedUser: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    await productRef.delete();

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
