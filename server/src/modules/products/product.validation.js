const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  category_id: Joi.string().uuid().allow(null, ''),
  base_price: Joi.number().min(0).default(0),
  cost_price: Joi.number().min(0).allow(null),
  type: Joi.string().valid('PHYSICAL', 'SERVICE', 'SUBSCRIPTION').default('PHYSICAL'),
  preferred_vendor_id: Joi.string().allow('', null),
  service_provider: Joi.string().allow('', null),
  service_sla: Joi.string().allow('', null),
  stock: Joi.number().min(0).allow(null),
  unit: Joi.string().allow('', null),
  image_url: Joi.string().allow('', null),
  is_active: Joi.boolean().default(true)
}).unknown(true);

const updateSchema = Joi.object({
  name: Joi.string(),
  sku: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  category_id: Joi.string().uuid().allow(null, ''),
  base_price: Joi.number().min(0),
  cost_price: Joi.number().min(0).allow(null),
  type: Joi.string().valid('PHYSICAL', 'SERVICE', 'SUBSCRIPTION'),
  preferred_vendor_id: Joi.string().allow('', null),
  service_provider: Joi.string().allow('', null),
  service_sla: Joi.string().allow('', null),
  stock: Joi.number().min(0).allow(null),
  unit: Joi.string().allow('', null),
  image_url: Joi.string().allow('', null),
  is_active: Joi.boolean()
}).min(1).unknown(true);

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

const validateUpdate = (req, res, next) => {
  const { error } = updateSchema.validate(req.body);
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

module.exports = { validateCreate, validateUpdate, validateUUID };
