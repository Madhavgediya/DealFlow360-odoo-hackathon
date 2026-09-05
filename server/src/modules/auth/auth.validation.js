const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required",
  }),
  role: Joi.string()
    .valid(
      "ADMIN",
      "SALES_REP",
      "SALES_MANAGER",
      "FINANCE",
      "OPERATIONS",
      "CUSTOMER",
    )
    .optional(),
});

const signinSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

const validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

const validateSignin = (req, res, next) => {
  const { error } = signinSchema.validate(req.body);
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

module.exports = {
  validateSignup,
  validateSignin,
};
