const Joi = require('joi');

const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'INACTIVE'];
const VALID_QUAL_STATUSES = ['UNQUALIFIED', 'WORKING', 'QUALIFIED', 'DISQUALIFIED'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const VALID_TRIAL_STATUSES = ['NOT_STARTED', 'ACTIVE', 'EXPIRED', 'CONVERTED'];

const createLeadSchema = Joi.object({
  first_name: Joi.string().trim().max(100).required(),
  last_name: Joi.string().trim().max(100).optional().allow('', null),
  company_name: Joi.string().trim().max(255).optional().allow('', null),
  email: Joi.string().trim().email().optional().allow('', null),
  phone: Joi.string().trim().max(50).optional().allow('', null),
  source: Joi.string().trim().max(100).optional().allow('', null),
  campaign: Joi.string().trim().max(100).optional().allow('', null),
  industry: Joi.string().trim().max(100).optional().allow('', null),
  country: Joi.string().trim().max(100).optional().allow('', null),
  city: Joi.string().trim().max(100).optional().allow('', null),
  estimated_budget: Joi.number().min(0).optional().allow(null),
  requirement: Joi.string().trim().optional().allow('', null),
  priority: Joi.string().valid(...VALID_PRIORITIES).optional(),
  assigned_user_id: Joi.string().guid({ version: ['uuidv4'] }).optional().allow(null),
  status: Joi.string().valid(...VALID_STATUSES).optional(),
  qualification_status: Joi.string().valid(...VALID_QUAL_STATUSES).optional(),
  lead_score: Joi.number().integer().min(0).max(100).optional().allow(null),
  score_band: Joi.string().trim().max(50).optional().allow('', null),
  trial_status: Joi.string().valid(...VALID_TRIAL_STATUSES).optional().allow(null),
  trial_started_at: Joi.date().iso().optional().allow(null),
  trial_ends_at: Joi.date().iso().optional().allow(null)
});

const updateLeadSchema = createLeadSchema.fork(
  ['first_name'],
  (schema) => schema.optional()
).min(1);

const statusSchema = Joi.object({
  status: Joi.string().valid(...VALID_STATUSES).required()
});

const filterSchema = Joi.object({
  status: Joi.string().valid(...VALID_STATUSES).optional(),
  assigned_user_id: Joi.string().guid({ version: ['uuidv4'] }).optional(),
  from_date: Joi.date().iso().optional(),
  to_date: Joi.date().iso().optional()
});

const validateUUID = (param) => (req, res, next) => {
  const id = req.params[param];
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
  const { error } = createLeadSchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

const validateUpdate = (req, res, next) => {
  const { error } = updateLeadSchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

const validateStatus = (req, res, next) => {
  const { error } = statusSchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

const validateFilters = (req, res, next) => {
  const { error } = filterSchema.validate(req.query);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

module.exports = { validateCreate, validateUpdate, validateStatus, validateFilters, validateUUID };
