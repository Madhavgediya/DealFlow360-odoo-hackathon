const Joi = require('joi');

const createPriceListSchema = Joi.object({
  name: Joi.string().required(),
  currency: Joi.string().length(3).default('USD'),
  is_active: Joi.boolean().default(true)
});

const updatePriceListSchema = Joi.object({
  name: Joi.string(),
  currency: Joi.string().length(3),
  is_active: Joi.boolean()
}).min(1);

const addPriceListItemSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  price: Joi.number().min(0).required()
});

const validateCreatePriceList = (req, res, next) => {
  const { error } = createPriceListSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 422;
    err.code = 'VALIDATION_ERROR';
    return next(err);
  }
  next();
};

const validateUpdatePriceList = (req, res, next) => {
  const { error } = updatePriceListSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 422;
    err.code = 'VALIDATION_ERROR';
    return next(err);
  }
  next();
};

const validateAddPriceListItem = (req, res, next) => {
  const { error } = addPriceListItemSchema.validate(req.body);
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

module.exports = { 
  validateCreatePriceList, 
  validateUpdatePriceList, 
  validateAddPriceListItem, 
  validateUUID 
};
