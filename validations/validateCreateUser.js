const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.empty": "Name is required.",
      "string.min": "Name must be at least 3 characters long.",
      "string.max": "Name must not exceed 50 characters.",
    })
    .required(),
  email: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.empty": "E-mail is required.",
      "string.min": "Name must be at least 3 characters long.",
      "string.max": "Name must not exceed 50 characters.",
    })
    .required(),
  phoneNum: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.empty": "Phone number is required.",
      "string.pattern.base": "Phone number must have 10 digits.",
    })
    .required(),
  password: Joi.string()
    .min(6)
    .max(30)
    .messages({
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 6 characters long.",
      "string.max": "Password must not exceed 30 characters.",
    })
    .required(),
  role: Joi.string().valid("admin", "user").required().messages({
    "any.required": "Role is required",
    "any.only": 'Role must be either "admin" or "user"',
    "string.base": "Role must be a string",
  }),
});

const validateCreateUser = (req, res, next) => {
  const { error } = createUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: messages });
  }

  next();
};

module.exports = validateCreateUser;
