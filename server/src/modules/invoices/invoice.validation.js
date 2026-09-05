const Joi = require('joi');

const generateSchema = Joi.object({
  order_id: Joi.string().uuid().required()
});

const issueSchema = Joi.object({
  due_date: Joi.date().iso().allow(null)
});

const validateGenerate = (req, res, next) => {
  const { error } = generateSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 422;
    err.code = 'VALIDATION_ERROR';
    return next(err);
  }
  next();
};

const validateIssue = (req, res, next) => {
  const { error } = issueSchema.validate(req.body);
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

module.exports = { validateGenerate, validateIssue, validateUUID };
