const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null, "./uploads_rar/");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/vnd.rar" ||
    file.mimetype === "application/zip" ||
    file.mimetype === "application/x-7z-compressed" ||
    file.mimetype === "application/x-tar"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Wrong format. Only apply rar, tar, zip, 7zip files"), false);
  }
};

const upload_rar = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter,
});

module.exports = upload_rar;
