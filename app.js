const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
var cors = require("cors");
const cookiePasrer = require("cookie-parser");
const morgan = require("morgan");
const multer = require('multer')

const app = express();

dotenv.config();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookiePasrer());
app.use(cors());
app.use(morgan("tiny"));

const pathPublic = path.join(__dirname, "/public");
app.use(express.static(pathPublic));

// =============== MONGOOSE ==================

mongoose.connect(process.env.URI_DATABASE, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ================ MULTER ==================
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Sai định dạng"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter,
});

// ================ ROUTE ===================
const userRoute = require("./routes/user.route");
app.use("/", userRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
