const ClothingItem = require("../models/clothingItem");
const BadRequestError = require("../utils/errors/bad-request-err");
const NotFoundError = require("../utils/errors/not-found-err");
const ForbiddenError = require("../utils/errors/forbidden-err");

const getItems = (req, res, next) => {
  const { weather, search } = req.query;
  const limit = Number(req.query.limit) || 20;
  const skip = Number(req.query.skip) || 0;

  const filter = {};

  if (weather) {
    filter.weather = weather;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  Promise.all([
    ClothingItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ClothingItem.countDocuments(filter),
  ])
    .then(([items, total]) => {
      res.send({
        data: items,
        meta: {
          total,
          returned: items.length,
          limit,
          skip,
        },
      });
    })
    .catch(next);
};

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid item data"));
      }
      return next(err);
    });
};

const deleteItem = (req, res, next) => {
  ClothingItem.findById(req.params.itemId)
    .orFail(() => new NotFoundError("Requested resource not found"))
    .then((item) => {
      if (String(item.owner) !== req.user._id) {
        throw new ForbiddenError("Forbidden");
      }
      return ClothingItem.findByIdAndDelete(req.params.itemId).then(() =>
        res.send({ data: item })
      );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      return next(err);
    });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => new NotFoundError("Item not found"))
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      return next(err);
    });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => new NotFoundError("Item not found"))
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      return next(err);
    });
};

module.exports = {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
