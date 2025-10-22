const { db } = require("../config/db");
const { hashPassword } = require("../utilities");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/* 
  Users Controller
*/

exports.getUsers = async (req, res) => {
  try {
    // Store the collection reference in variable
    const usersRef = db.collection("users");

    // If an id is provided, retrieve the specific user
    if (req.query.id) {
      const userId = req.query.id;
      const userDoc = await usersRef.doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = userDoc.data();

      return res.json({
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        phoneNum: userData.phoneNum,
        password: userData.password,
        role: userData.role,
      });
    }

    // All users in alphabetical order
    const snapshot = await usersRef.orderBy("name", "asc").get();

    let users = [];

    snapshot.forEach((user) => {
      users.push({
        id: user.id,
        name: user.data().name,
        email: user.data().email,
        phoneNum: user.data().phoneNum,
        password: user.data().password,
        role: user.data().role,
      });
    });

    // If there's no id provided, return all users
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error, error });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, phoneNum, password, role } = req.body;
    const usersRef = db.collection("users");

    // Check if email is already registered
    const snapshot = await usersRef.where("email", "==", email).get();
    if (!snapshot.empty) {
      return res.status(400).json({
        errors: ["Email is already registered."],
      });
    }

    // Hash password before saving
    const hashedPassword = await hashPassword(password);

    // Create new document with auto-generated ID
    const newUserData = {
      name,
      email,
      phoneNum,
      password: hashedPassword,
      role,
    };
    const newUserRef = await usersRef.add(newUserData);

    // Generate a new login token for the user
    let token;
    try {
      token = jwt.sign(
        {
          _id: newUserRef.id,
          name: newUserData.name,
          phoneNum: newUserData.phoneNum,
          role: newUserData.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_SECRET_EXPIRE }
      );
    } catch (error) {
      return res.status(500).json({
        error: "Token generation failed",
        details: error.message,
      });
    }

    // Combine ID and data into one object
    const newUser = {
      id: newUserRef.id,
      ...newUserData,
    };

    return res.status(201).json({
      message: "User created successfully",
      newUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let hashedPassword;
    if (req.body.password) {
      hashedPassword = await hashPassword(req.body.password);
    }

    // Changing the fields is optional
    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.phoneNum) updateFields.phoneNum = req.body.phoneNum;
    if (req.body.email) updateFields.email = req.body.email;
    if (req.body.role) updateFields.role = req.body.role;
    if (req.body.password) updateFields.password = hashedPassword;

    const userId = req.query.id;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRef.update(updateFields);

    // Generate a new login token for the user
    let token;
    try {
      token = jwt.sign(
        {
          _id: userId,
          name: userDoc.data().name,
          phoneNum: userDoc.data().phoneNum,
          role: userDoc.data().role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_SECRET_EXPIRE }
      );
    } catch (error) {
      return res.status(500).json({
        error: "Token generation failed",
        details: error.message,
      });
    }

    const updatedDoc = await userRef.get();
    const updatedUser = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    return res.status(200).json({
      message: "User updated successfully",
      updatedUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.query.id;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRef.delete();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controls the login system
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for existing token
    const authHeader = req.headers.authorization;
    const existingToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (existingToken) {
      // If there's a token, validate it
      try {
        jwt.verify(existingToken, process.env.JWT_SECRET);
      } catch (err) {
        console.warn("Invalid or expired token:", err.message);
        return res.status(401).json({
          message: "Session expired or token invalid. Please log in again.",
        });
      }

      return res.status(200).json({
        message: "Already logged in",
        token: existingToken,
      });
    }

    // Proceed with login using Firestore
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(401).json({ errors: ["E-mail not found"] });
    }

    // Get the user, emails are unique so we don't need to check for duplicates
    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ errors: ["Invalid Password"] });

    // Issue new token
    const newToken = jwt.sign(
      {
        _id: userDoc.id,
        name: user.name,
        phoneNum: user.phoneNum,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_SECRET_EXPIRE }
    );

    return res.status(201).json({
      message: "Logged in successfully",
      token: newToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};
