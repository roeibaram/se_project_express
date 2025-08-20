const router = require("express").Router();

const auth = require("../middlewares/auth");
const { login, createUser } = require("../controllers/users");
const { getItems } = require("../controllers/clothingItems");
const usersRouter = require("./users");
const clothingItemsRouter = require("./clothingItems");

router.post("/signin", login);
router.post("/signup", createUser);
router.get("/items", getItems);
router.use(auth);
router.use("/users", usersRouter);
router.use("/items", clothingItemsRouter);

module.exports = router;
