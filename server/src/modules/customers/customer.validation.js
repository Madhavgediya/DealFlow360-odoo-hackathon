const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().required(),
  industry: Joi.string().allow('', null),
  website: Joi.string().uri().allow('', null),
  address: Joi.string().allow('', null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').default('ACTIVE')
});

const updateSchema = Joi.object({
  name: Joi.string(),
  industry: Joi.string().allow('', null),
  website: Joi.string().uri().allow('', null),
  address: Joi.string().allow('', null),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED')
}).min(1);

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
