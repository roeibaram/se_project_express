const ClothingItem = require("../models/clothingItem");
const BadRequestError = require("../utils/errors/bad-request-err");
const NotFoundError = require("../utils/errors/not-found-err");
const ForbiddenError = require("../utils/errors/forbidden-err");

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
};

const getItems = (req, res, next) => {
  const { weather, search, sort = "newest" } = req.query;
  const limit = Number(req.query.limit) || 20;
  const skip = Number(req.query.skip) || 0;

  const filter = {};

  if (weather) {
    filter.weather = weather;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const sortOption = SORT_MAP[sort] || SORT_MAP.newest;

  Promise.all([
    ClothingItem.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
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
          sort,
        },
      });
    })
    .catch(next);
};

const getItemsStats = (req, res, next) => {
  ClothingItem.aggregate([
    {
      $project: {
        weather: 1,
        likesCount: { $size: "$likes" },
      },
    },
    {
      $group: {
        _id: "$weather",
        count: { $sum: 1 },
        totalLikes: { $sum: "$likesCount" },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ])
    .then((groupedStats) => {
      const byWeather = groupedStats.map((group) => ({
        weather: group._id,
        count: group.count,
        totalLikes: group.totalLikes,
        averageLikes:
          group.count > 0
            ? Number((group.totalLikes / group.count).toFixed(2))
            : 0,
      }));

      const totalItems = byWeather.reduce((sum, entry) => sum + entry.count, 0);
      const totalLikes = byWeather.reduce(
        (sum, entry) => sum + entry.totalLikes,
        0
      );

      res.send({
        data: {
          totalItems,
          totalLikes,
          byWeather,
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
  getItemsStats,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
