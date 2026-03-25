const { celebrate, Joi } = require("celebrate");
const validator = require("validator");

const validateURL = (value) => {
  if (validator.isURL(value)) {
    return value;
  }

  throw new Error("Invalid URL");
};

module.exports.validateCardBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    imageUrl: Joi.string().required().custom(validateURL),
    weather: Joi.string().required().valid("hot", "warm", "cold"),
  }),
});

module.exports.validateUserBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    avatar: Joi.string().required().custom(validateURL),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

module.exports.validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

module.exports.validateItemsQuery = celebrate({
  query: Joi.object().keys({
    weather: Joi.string().valid("hot", "warm", "cold"),
    search: Joi.string().trim().min(1).max(30),
    limit: Joi.number().integer().min(1).max(50),
    skip: Joi.number().integer().min(0).max(500),
  }),
});

module.exports.validateId = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24),
    itemId: Joi.string().hex().length(24),
  }),
});
