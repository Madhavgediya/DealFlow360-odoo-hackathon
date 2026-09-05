const Joi = require('joi');

const createWarehouseSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().allow('', null),
  is_active: Joi.boolean().default(true)
});

const stockMovementSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
  reference_type: Joi.string().allow('', null),
  reference_id: Joi.string().uuid().allow(null)
});

const validateCreateWarehouse = (req, res, next) => {
  const { error } = createWarehouseSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 422;
    err.code = 'VALIDATION_ERROR';
    return next(err);
  }
  next();
};

const validateStockMovement = (req, res, next) => {
  const { error } = stockMovementSchema.validate(req.body);
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

module.exports = { validateCreateWarehouse, validateStockMovement, validateUUID };
