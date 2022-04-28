const express = require("express");
const Router = express.Router();
const upload = require("../utils/multer");
const userController = require("../controllers/userController");
const validator = require("../utils/validators");
const { verifyToken, isLogin } = require("../middlewares/verifyToken");

Router.route("/register")
  .get(verifyToken, userController.getRegister)
  .post(
    upload.array("image", 2),
    validator.register,
    userController.postRegister
  );

Router.route("/login")
  .get(verifyToken, userController.getLogin)
  .post(validator.login, userController.postLogin);

Router.get("/", verifyToken, userController.getHome);
module.exports = Router;
