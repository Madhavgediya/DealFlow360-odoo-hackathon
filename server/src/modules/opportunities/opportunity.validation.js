const Joi = require('joi');

const STAGES = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

const createSchema = Joi.object({
  customer_id: Joi.string().uuid().required(),
  name: Joi.string().required(),
  amount: Joi.number().min(0).allow(null),
  stage: Joi.string().valid(...STAGES).default('PROSPECTING'),
  probability: Joi.number().min(0).max(100).default(10),
  expected_close_date: Joi.date().iso().allow(null),
  assigned_user_id: Joi.string().uuid().allow(null)
});

const updateSchema = Joi.object({
  name: Joi.string(),
  amount: Joi.number().min(0).allow(null),
  stage: Joi.string().valid(...STAGES),
  probability: Joi.number().min(0).max(100),
  expected_close_date: Joi.date().iso().allow(null),
  assigned_user_id: Joi.string().uuid().allow(null)
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
