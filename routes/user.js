const express = require("express");
const Router = express.Router();
const upload = require("../utils/multer");
const userController = require("../controllers/userController");
const validator = require("../utils/validators");
const { verifyToken, isLogin } = require("../middlewares/verifyToken");

Router.route("/register")
  .get(userController.getRegister)
  .post(
    upload.array("image", 2),
    validator.register,
    userController.postRegister
  );

Router.route("/login")
  .get(userController.getLogin)
  .post(validator.login, userController.postLogin);

Router.route("/change-password").get(userController.getChangePassword);
// .post(validator.login, userController.postChangePassword);

Router.get("/", userController.getHome);
module.exports = Router;
