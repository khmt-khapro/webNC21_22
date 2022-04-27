const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const createUser = require("../utils/createUser");
// const mailer = require("../utils/mailer");
const cloudinary = require("../utils/cloudinary");
const { sendToUser } = require("../utils/sendMail");
const fs = require("fs");

// RENDER REGISTER
exports.getRegister = (req, res) => {
  const error = req.flash("error") || "";
  res.render("page/register", { error });
};

// HANDLE REGISTER USER
exports.postRegister = async (req, res) => {
  // UPLOAD CMND
  const uploader = async (path) => await cloudinary.uploads(path, "Images");
  const files = req.files;
  const urls = [];

  for (let file of files) {
    const { path } = file;
    const newPath = await uploader(path);
    urls.push(newPath);
    fs.unlinkSync(path);
  }

  let message;
  let result = validationResult(req);
  if (result.errors.length == 0) {
    // create user + pass random
    const userName = createUser.generateID();
    const password = createUser.generatePwd();

    // hash mật khẩu, salt 10 vòng
    const hashedPassword = bcrypt.hashSync(password, 10);

    const userInfo = {
      ...req.body,
      userName: userName,
      password: hashedPassword,
      idCard: urls,
    };

    const newUser = new User(userInfo);
    try {
      await newUser.save();
      await sendToUser(req, userName, password);

      res.redirect("/user/login");
    } catch (err) {
      console.log(err.message);
      req.flash("error", err.message);
      res.redirect("/user/register");
    }
  } else {
    result = result.mapped();
    for (fields in result) {
      message = result[fields].msg;
      break;
    }
    req.flash("error", message);
    res.redirect("/user/register");
  }
};
