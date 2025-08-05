const express = require("express");
const mongoose = require("mongoose");

const { PORT = 3001 } = process.env;
const { NOT_FOUND } = require("./utils/errors");

const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");

mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: "6890715cdab674df78e2dfd8",
  };
  next();
});

app.use("/users", usersRouter);
app.use("/items", itemsRouter);

app.use((req, res) => {
  res.status(NOT_FOUND).send({ message: "Requested resource not found" });
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
