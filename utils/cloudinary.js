const cloudinary = require("cloudinary");
require("dotenv").config();

// const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;
// console.log(CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET);
// cloudinary.config({
//   cloud_name: CLOUDINARY_NAME,
//   api_key: CLOUDINARY_KEY,
//   api_secret: CLOUDINARY_SECRET,
// });

cloudinary.config({
  cloud_name: "khait",
  api_key: "839592211368859",
  api_secret: "HWZZCKSzJajJIR6O1Kzfzzy-ioQ",
});

exports.uploads = (file, folder) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve(result.url);
      },
      {
        resource_type: "auto",
        folder: folder,
      }
    );
  });
};
