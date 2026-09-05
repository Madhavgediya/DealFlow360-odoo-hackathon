const Joi = require('joi');

const ENTITY_TYPES = ['LEAD', 'OPPORTUNITY', 'CUSTOMER'];
const INTERACTION_TYPES = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'DEMO', 'FOLLOW_UP', 'OTHER'];

const createSchema = Joi.object({
  entity_type: Joi.string().valid(...ENTITY_TYPES).required(),
  entity_id: Joi.string().uuid().required(),
  interaction_type: Joi.string().valid(...INTERACTION_TYPES).required(),
  notes: Joi.string().allow('', null),
  outcome: Joi.string().allow('', null),
  next_followup_at: Joi.date().iso().allow(null)
});

const updateSchema = Joi.object({
  interaction_type: Joi.string().valid(...INTERACTION_TYPES),
  notes: Joi.string().allow('', null),
  outcome: Joi.string().allow('', null),
  next_followup_at: Joi.date().iso().allow(null)
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
