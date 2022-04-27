const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./upload/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const imageFilter = (req, file, cb) => {
  if (file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
    cb(null, true);
  } else {
    cb({ message: "File type not support" }, false);
  }
};

let upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2000000 },
});

module.exports = upload;
