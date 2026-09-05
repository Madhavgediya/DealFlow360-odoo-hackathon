const Joi = require('joi');

const createPermissionSchema = Joi.object({
  module: Joi.string().trim().required().messages({
    'string.empty': 'Module is required'
  }),
  action: Joi.string().trim().required().messages({
    'string.empty': 'Action is required'
  }),
  resource: Joi.string().trim().required().messages({
    'string.empty': 'Resource is required'
  }),
  description: Joi.string().allow('', null).optional()
});

const updatePermissionSchema = Joi.object({
  module: Joi.string().trim().optional(),
  action: Joi.string().trim().optional(),
  resource: Joi.string().trim().optional(),
  description: Joi.string().allow('', null).optional()
}).min(1);

const validateCreatePermission = (req, res, next) => {
  const { error } = createPermissionSchema.validate(req.body);
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

const validateUpdatePermission = (req, res, next) => {
  const { error } = updatePermissionSchema.validate(req.body);
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

module.exports = {
  validateCreatePermission,
  validateUpdatePermission
};
