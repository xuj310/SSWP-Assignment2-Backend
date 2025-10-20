const Joi = require("joi");

const updateProductSchema = Joi.object({
  id: Joi.string(),
  imgUrl: Joi.string()
    .messages({
      "string.empty": "An image url is required.",
    })
    .required(),
  title: Joi.string().min(3).max(50).messages({
    "string.min": "Title must be at least 3 characters long.",
    "string.max": "Title must not exceed 50 characters.",
  }),
  description: Joi.string().messages({
    "string.min": "Description must be at least 3 characters long.",
    "string.max": "Description must not exceed 255 characters.",
  }),
  date: Joi.number().integer().messages({
    "number.base": "Date must be an integer.",
  }),
  price: Joi.number().integer().messages({
    "number.base": "Price in Dollars (AUD) is required.",
  }),
  onSale: Joi.boolean(),
});

const validateUpdateProduct = (req, res, next) => {
  const { error } = updateProductSchema.validate(req.body, {
    abortEarly: false,
  });

  const messages = [];

  // Collect all the validation errors
  if (error && error.details) {
    error.details.forEach((detail) => {
      messages.push(detail.message);
    });
  }

  if (messages.length > 0) {
    return res.status(400).json({ errors: messages });
  }

  next();
};

module.exports = validateUpdateProduct;
