const Joi = require('joi');

const VALID_TYPES = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'DEMO', 'FOLLOW_UP', 'OTHER'];
const VALID_DIRECTIONS = ['INBOUND', 'OUTBOUND'];

const createInteractionSchema = Joi.object({
  interaction_type: Joi.string().valid(...VALID_TYPES).required(),
  direction: Joi.string().valid(...VALID_DIRECTIONS).optional(),
  subject: Joi.string().trim().max(255).optional().allow('', null),
  notes: Joi.string().trim().optional().allow('', null),
  outcome: Joi.string().trim().max(255).optional().allow('', null),
  next_followup_at: Joi.date().iso().optional().allow(null)
});

const updateInteractionSchema = createInteractionSchema.fork(
  ['interaction_type'],
  (schema) => schema.optional()
).min(1);

const validateUUID = (param) => (req, res, next) => {
  const id = req.params[param];
  if (!id) return next();
  const { error } = Joi.string().guid({ version: ['uuidv4'] }).validate(id);
  if (error) {
    const err = new Error('Invalid identifier format.');
    err.statusCode = 400;
    err.code = 'INVALID_ID';
    return next(err);
  }
  next();
};

const validateCreate = (req, res, next) => {
  const { error } = createInteractionSchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

const validateUpdate = (req, res, next) => {
  const { error } = updateInteractionSchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

module.exports = { validateCreate, validateUpdate, validateUUID };
