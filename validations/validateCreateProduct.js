const Joi = require("joi");

const createProductSchema = Joi.object({
  imgUrl: Joi.string()
    .messages({
      "string.empty": "An image url is required.",
    })
    .required(),
  title: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.empty": "Title is required.",
      "string.min": "Title must be at least 3 characters long.",
      "string.max": "Title must not exceed 50 characters.",
    })
    .required(),
  description: Joi.string()
    .messages({
      "string.empty": "Description is required.",
      "string.min": "Description must be at least 3 characters long.",
      "string.max": "Description must not exceed 255 characters.",
    })
    .required(),
  price: Joi.number()
    .integer()
    .messages({
      "number.base": "Price in Dollars (AUD) is required.",
    })
    .required(),
  onSale: Joi.boolean().required(),
});

const validateCreateProduct = (req, res, next) => {
  const { error } = createProductSchema.validate(req.body, {
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

module.exports = validateCreateProduct;
