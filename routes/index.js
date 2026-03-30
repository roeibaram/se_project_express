const router = require("express").Router();

const auth = require("../middlewares/auth");
const { login, createUser } = require("../controllers/users");
const { getItems, getItemsStats } = require("../controllers/clothingItems");
const usersRouter = require("./users");
const clothingItemsRouter = require("./clothingItems");
const {
  validateUserBody,
  validateLogin,
  validateItemsQuery,
} = require("../middlewares/validation");

router.post("/signin", validateLogin, login);
router.post("/signup", validateUserBody, createUser);
router.get("/items/stats", getItemsStats);
router.get("/items", validateItemsQuery, getItems);
router.use(auth);
router.use("/users", usersRouter);
router.use("/items", clothingItemsRouter);

module.exports = router;
