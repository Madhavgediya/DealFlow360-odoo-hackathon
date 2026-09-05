const Joi = require('joi');

const ALLOWED_STATUSES = ['ACTIVE', 'INACTIVE'];
const ALLOWED_ROLES = ['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS', 'CUSTOMER'];

const createUserSchema = Joi.object({
  first_name: Joi.string().trim().max(100).required(),
  last_name: Joi.string().trim().max(100).optional().allow('', null),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().trim().max(50).optional().allow('', null),
  avatar_url: Joi.string().trim().uri().optional().allow('', null),
  role: Joi.string().valid(...ALLOWED_ROLES).optional(),
  status: Joi.string().valid(...ALLOWED_STATUSES).optional()
});

const updateUserSchema = Joi.object({
  first_name: Joi.string().trim().max(100).optional(),
  last_name: Joi.string().trim().max(100).optional().allow('', null),
  phone: Joi.string().trim().max(50).optional().allow('', null),
  avatar_url: Joi.string().trim().uri().optional().allow('', null)
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
  const { error } = createUserSchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

const validateUpdate = (req, res, next) => {
  const { error } = updateUserSchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

const validateStatus = (req, res, next) => {
  const { error } = statusSchema.validate(req.body);
  if (error) { error.isJoi = true; return next(error); }
  next();
};

module.exports = { validateCreate, validateUpdate, validateStatus, validateUUID };
