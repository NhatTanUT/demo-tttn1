const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
var cors = require("cors");
const cookiePasrer = require("cookie-parser");
const morgan = require("morgan");

const app = express();

dotenv.config();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookiePasrer());
app.use(cors());
app.use(morgan("tiny"));

const pathPublic = path.join(__dirname, "./public");
app.use(express.static(pathPublic));

// =============== MONGOOSE ==================

mongoose.connect(process.env.URI_DATABASE, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ================ ROUTE ===================
const userRoute = require("./routes/user.route");
app.use("/", userRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
