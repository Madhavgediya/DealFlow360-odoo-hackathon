const Joi = require('joi');

const createSchema = Joi.object({
  customer_id: Joi.string().uuid().required(),
  opportunity_id: Joi.string().uuid().allow(null),
  valid_until: Joi.date().iso().allow(null)
});

const addLineSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  price_list_id: Joi.string().uuid().allow(null),
  quantity: Joi.number().integer().min(1).default(1),
  discount_percent: Joi.number().min(0).max(100).default(0)
});

const validateCreate = (req, res, next) => {
  const { error } = createSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 422;
    err.code = 'VALIDATION_ERROR';
    return next(err);
  }
  next();
};

const validateAddLine = (req, res, next) => {
  const { error } = addLineSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 422;
    err.code = 'VALIDATION_ERROR';
    return next(err);
  }
  next();
};

const validateUUID = (paramName) => (req, res, next) => {
  const schema = Joi.string().uuid();
  const { error } = schema.validate(req.params[paramName]);
  if (error) {
    const err = new Error(`Invalid ${paramName} format`);
    err.statusCode = 400;
    err.code = 'INVALID_ID';
    return next(err);
  }
  next();
};

module.exports = { validateCreate, validateAddLine, validateUUID };
