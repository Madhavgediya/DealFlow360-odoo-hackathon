const Joi = require('joi');

const ALLOWED_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

const createCompanySchema = Joi.object({
  name: Joi.string().trim().max(255).required(),
  legal_name: Joi.string().trim().max(255).optional().allow('', null),
  code: Joi.string().trim().max(50).required(),
  email: Joi.string().trim().email().optional().allow('', null),
  phone: Joi.string().trim().max(50).optional().allow('', null),
  country: Joi.string().trim().max(100).optional().allow('', null),
  timezone: Joi.string().trim().max(100).optional().allow('', null),
  default_currency_id: Joi.string().trim().max(10).optional().allow('', null),
  status: Joi.string().valid(...ALLOWED_STATUSES).optional()
});

const updateCompanySchema = Joi.object({
  name: Joi.string().trim().max(255).optional(),
  legal_name: Joi.string().trim().max(255).optional().allow('', null),
  code: Joi.string().trim().max(50).optional(),
  email: Joi.string().trim().email().optional().allow('', null),
  phone: Joi.string().trim().max(50).optional().allow('', null),
  country: Joi.string().trim().max(100).optional().allow('', null),
  timezone: Joi.string().trim().max(100).optional().allow('', null),
  default_currency_id: Joi.string().trim().max(10).optional().allow('', null)
}).min(1);

const statusSchema = Joi.object({
  status: Joi.string().valid(...ALLOWED_STATUSES).required()
});

const validateUUID = (req, res, next) => {
  const id = req.params.id;
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
  const { error } = createCompanySchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

const validateUpdate = (req, res, next) => {
  const { error } = updateCompanySchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

const validateStatus = (req, res, next) => {
  const { error } = statusSchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

module.exports = { validateCreate, validateUpdate, validateStatus, validateUUID };
