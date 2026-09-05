const Joi = require('joi');

const registerPaymentSchema = Joi.object({
  invoice_id: Joi.string().uuid().required(),
  amount: Joi.number().min(0.01).required(),
  payment_method: Joi.string().valid('CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'OTHER').required(),
  reference_number: Joi.string().allow('', null)
});

const validateRegister = (req, res, next) => {
  const { error } = registerPaymentSchema.validate(req.body);
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

module.exports = { validateRegister, validateUUID };
