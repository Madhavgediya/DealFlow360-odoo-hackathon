const Joi = require('joi');

const createRoleSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required'
  }),
  code: Joi.string().trim().required().messages({
    'string.empty': 'Code is required'
  }),
  description: Joi.string().allow('', null).optional(),
  is_system: Joi.boolean().optional()
});

const updateRoleSchema = Joi.object({
  name: Joi.string().trim().optional(),
  code: Joi.string().trim().optional(),
  description: Joi.string().allow('', null).optional(),
  is_system: Joi.boolean().optional()
}).min(1);

const validateCreateRole = (req, res, next) => {
  const { error } = createRoleSchema.validate(req.body);
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

const validateUpdateRole = (req, res, next) => {
  const { error } = updateRoleSchema.validate(req.body);
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

const validateUUID = (req, res, next) => {
  const uuidSchema = Joi.string().guid({ version: ['uuidv4'] });
  
  // Checking typical params like id, roleId, userId depending on the route
  const keysToCheck = ['id', 'roleId', 'userId'];
  for (const key of keysToCheck) {
    if (req.params[key]) {
      const { error } = uuidSchema.validate(req.params[key]);
      if (error) {
        const err = new Error('Invalid identifier format.');
        err.code = 'INVALID_ID';
        err.statusCode = 400;
        return next(err);
      }
    }
  }
  next();
};

module.exports = {
  validateCreateRole,
  validateUpdateRole,
  validateUUID
};
