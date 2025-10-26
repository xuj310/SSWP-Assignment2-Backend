const Joi = require("joi");
const fs = require("fs");
const path = require("path");

const createProductSchema = Joi.object({
  title: Joi.string().min(3).max(50).required().empty("").messages({
    "string.empty": "Title is required.",
    "string.min": "Title must be at least 3 characters long.",
    "string.max": "Title must not exceed 50 characters.",
    "any.required": "Title is required.",
  }),
  description: Joi.string().min(3).max(255).required().empty("").messages({
    "string.empty": "Description is required.",
    "string.min": "Description must be at least 3 characters long.",
    "string.max": "Description must not exceed 255 characters.",
    "any.required": "Description is required.",
  }),
  price: Joi.number().required().messages({
    "number.base": "Price must be a valid number.",
    "any.required": "Price is required.",
  }),
  onSale: Joi.boolean().truthy("true").falsy("false").required().messages({
    "any.required": "onSale is required.",
  }),
  inStock: Joi.boolean().truthy("true").falsy("false").required().messages({
    "any.required": "inStock is required.",
  }),
});

const validateCreateProduct = (req, res, next) => {
  const { error, value } = createProductSchema.validate(req.body, {
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

module.exports = validateCreateProduct;
