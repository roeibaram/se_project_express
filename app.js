const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { PORT = 3001 } = process.env;
const { NOT_FOUND } = require("./utils/errors");

const routes = require("./routes");
const { login, createUser } = require("./controllers/users");
const { getItems } = require("./controllers/clothingItems");
const auth = require("./middlewares/auth");

mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/signin", login);
app.post("/signup", createUser);
app.get("/items", getItems);

app.use(auth);
app.use(routes);

app.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Requested resource not found" });
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
