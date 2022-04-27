const express = require("express");
const Router = express.Router();
const { check } = require("express-validator");
const userController = require("../controllers/userController");
const upload = require("../utils/multer");

const registerValidator = [
  check("name")
    .exists()
    .withMessage("Vui lòng nhập tên người dùng")
    .notEmpty()
    .withMessage("Tên người dùng không được để trống"),

  check("email")
    .exists()
    .withMessage("Vui lòng nhập email")
    .notEmpty()
    .withMessage("Email không được để trống")
    .isEmail()
    .withMessage("Email không hợp lệ"),

  check("phone")
    .exists()
    .withMessage("Vui lòng nhập số điện thoại")
    .notEmpty()
    .withMessage("Số điện thoại không được để trống")
    .custom((value, { req }) => {
      const regex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
      if (value.match(regex)) {
        return true; // return "non-falsy" value to indicate valid data"
      } else {
        return false; // return "falsy" value to indicate invalid data
      }
    })
    .withMessage(`Số điện thoại hợp lệ, hãy kiểm tra lại`),

  check("birthday")
    .exists()
    .withMessage("Vui lòng nhập ngày sinh")
    .notEmpty()
    .withMessage("Ngày sinh không được để trống"),

  check("address")
    .exists()
    .withMessage("Vui lòng nhập địa chỉ")
    .notEmpty()
    .withMessage("Địa chỉ không được để trống"),
];

Router.route("/register")
  .get(userController.getRegister)
  .post(
    upload.array("image", 2),
    registerValidator,
    userController.postRegister
  );

module.exports = Router;
