const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const createUser = require("../utils/createUser");
const cloudinary = require("../utils/cloudinary");
const { validationResult } = require("express-validator");
const { sendToUser } = require("../utils/sendMail");
const jwt = require("jsonwebtoken");

// RENDER REGISTER PAGE
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

// RENDER LOGIN PAGE
exports.getLogin = (req, res) => {
  const error = req.flash("error") || "";
  res.render("page/login", { error });
};

// HANDLE LOGIN LOGIC + JWT
exports.postLogin = async (req, res) => {
  let message;
  const { username, pwd } = req.body;
  let result = validationResult(req);
  if (result.errors.length == 0) {
    try {
      // query db
      const user = await User.findOne({ userName: username });
      if (!user) {
        req.flash("error", "Username hoặc mật khẩu không đúng");
        return res.redirect("/user/login");
      }

      // compare password
      const matchPassword = bcrypt.compareSync(pwd, user.password);
      if (!matchPassword) {
        req.flash("error", "Username hoặc mật khẩu không đúng");
        return res.redirect("/user/login");
      }

      // check first time login 
      if(user.firstLogin){
        return res.redirect("/user/change-password")
      }

      // create access token
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("accessToken", accessToken, { signed: true });
      res.redirect("/user");
      // const { password, ...otherInfo } = user._doc
      // res.status(200).json({ ...otherInfo, accessToken })
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/user/login");
    }
  } else {
    //có lỗi ở client
    result = result.mapped();
    for (fields in result) {
      message = result[fields].msg;
      break;
    }

    req.flash("error", message);
    // req.flash("username", username);
    res.redirect("/user/login");
  }
};

exports.getHome = (req, res) => {
  // const accessToken = req.signedCookies.accessToken;
  // try {
  //   const verify = jwt.verify(accessToken, process.env.JWT_SECRET);
  //   console.log(verify);
  // } catch (err) {
  //   res.send(err.message);
  // }
  console.log(req.user);
  res.send("welcome");
};


exports.getChangePassword = (req, res) => {
  res.render('change-password')
}