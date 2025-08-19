const router = require("express").Router();
const usersRouter = require("./users");
const clothingItemsRouter = require("./clothingItems");

router.use("/users", usersRouter);
router.use("/items", clothingItemsRouter);

module.exports = router;
