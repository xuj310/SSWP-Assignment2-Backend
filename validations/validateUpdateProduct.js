const Joi = require("joi");
const fs = require("fs");
const path = require("path");

const updateProductSchema = Joi.object({
  id: Joi.string(),
  title: Joi.string().min(3).max(50).messages({
    "string.min": "Title must be at least 3 characters long.",
    "string.max": "Title must not exceed 50 characters.",
  }),
  description: Joi.string().min(3).max(255).messages({
    "string.min": "Description must be at least 3 characters long.",
    "string.max": "Description must not exceed 255 characters.",
  }),
  date: Joi.number().integer().messages({
    "number.base": "Date must be an integer.",
  }),
  price: Joi.number().integer().messages({
    "number.base": "Price in Dollars (AUD) is required.",
  }),
  onSale: Joi.boolean().truthy("true").falsy("false"),
  inStock: Joi.boolean().truthy("true").falsy("false"),
});

const validateUpdateProduct = (req, res, next) => {
  const { error, value } = updateProductSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    // Delete uploaded image if validation fails
    if (req.file && req.file.filename) {
      const localPath = path.join("uploads", req.file.filename);
      fs.unlink(localPath, (err) => {
        if (err) {
          console.error("Failed to delete invalid image:", err.message);
        } else {
          console.log(
            "Deleted image due to validation failure:",
            req.file.filename
          );
        }
      });
    }

    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: messages });
  }

  req.body = value;
  next();
};

module.exports = validateUpdateProduct;
