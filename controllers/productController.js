const { db } = require("../config/db");
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
        imgUrl: productData.imgUrl,
        id: productDoc.id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        onSale: productData.onSale,
      });
    }

    // Sorted users
    const snapshot = await productsRef.orderBy("title", "asc").get();

    let products = [];

    snapshot.forEach((user) => {
      products.push({
        imgUrl: user.data().imgUrl,
        id: user.id,
        title: user.data().title,
        description: user.data().description,
        price: user.data().price,
        onSale: user.data().onSale,
      });
    });

    // If there's no id provided, return all users
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error, error });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { imgUrl, title, description, price, onSale } = req.body;

    // Store the collection reference in variable
    const productsRef = db.collection("products");

    // Create new document with auto-generated ID
    const newProductData = {
      imgUrl,
      title,
      description,
      price,
      onSale,
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
    // Changing the fields is optional
    const updateFields = {};
    if (req.body.imgUrl) updateFields.imgUrl = req.body.imgUrl;
    if (req.body.description) updateFields.description = req.body.description;
    if (req.body.title) updateFields.title = req.body.title;
    if (req.body.price) updateFields.price = req.body.price;
    if (req.body.onSale) {
      const onSale = req.body.onSale === "true"; 
      updateFields.onSale = onSale;
    }

    const productId = req.query.id;
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    await productRef.update(updateFields);

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
