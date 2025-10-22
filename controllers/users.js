const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const BadRequestError = require("../utils/errors/bad-request-err");
const NotFoundError = require("../utils/errors/not-found-err");
const ConflictError = require("../utils/errors/conflict-err");
const UnauthorizedError = require("../utils/errors/unauthorized-err");
const { JWT_SECRET } = require("../utils/config");

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const { _id } = user;
      res.send({
        data: { _id, name: user.name, avatar: user.avatar, email: user.email },
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError("Email already exists"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid user data"));
      }
      return next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError("Requested resource not found"))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid user ID"));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      if (err.message && err.message.includes("Incorrect email or password")) {
        return next(new UnauthorizedError("Incorrect email or password"));
      }
      return next(err);
    });
};

const updateCurrentUser = (req, res, next) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail(() => new NotFoundError("Requested resource not found"))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid user data"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid user ID"));
      }
      return next(err);
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
