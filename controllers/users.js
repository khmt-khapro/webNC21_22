const asyncHandler = require("express-async-handler");
const asyncBusboy = require("async-busboy");
const user = require("../model/users");
const sendMail = require("../middlewares/sendMail");
const userMiddleware = require("../middlewares/users");
const bcrypt = require("bcrypt");
const { formatDateTime } = require("../utils/util");
const { getLoginTime } = require("../model/users");
const Speakeasy = require("speakeasy");
const { ADMIN_USR, ADMIN_PWD } = require("../utils/util.enum");

module.exports = {
  GET_SIGNIN: asyncHandler(async (req, res) => {
    res.render("auth/login");
  }),

  GET_SIGNUP: asyncHandler(async (req, res) => {
    res.render("auth/register");
  }),

  SIGNIN: asyncHandler(async (req, res) => {
    const { userName, password } = req.body;

    if (userName === ADMIN_USR) {
      const isMatch = password === ADMIN_PWD ? true : false;

      if (isMatch) {
        req.session.role = "admin";
        return res.send({
          success: true,
          status: "Đăng nhập tài khoản thành công",
          role: "admin",
        });
      }
      return res.status(400).json({
        loginError: "Thông tin mật khẩu không chính xác",
      });
    }

    const found = await user.findByUsername(userName);
    if (!found?.status) {
      return res.status(400).json({
        loginError: "Tên đăng nhập không tồn tại",
        reason: "username",
      });
    }

    const isMatch = bcrypt.compareSync(
      password,
      found?.payload[0]?.password || ""
    );

    const checkUserUnsecret = await userMiddleware.checkUserUnsecret(
      found?.payload[0]?.user_id
    );

    if (checkUserUnsecret?.loginError) {
      return res.status(400).json(checkUserUnsecret);
    }

    if (found?.payload[0]?.status === 2) {
      return res.status(400).json({
        loginError:
          "Tài khoản này đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008",
      });
    }

    if (!isMatch) {
      const getUserUnsecret = await user.getUserUnsecret(
        found?.payload[0]?.user_id
      );
      const unsecretTime = getUserUnsecret?.not_secure_login || 0;
      const newUnsecretTime = unsecretTime + 1;

      await user.saveUserUnsecret(
        found?.payload[0]?.user_id,
        newUnsecretTime,
        "",
        "",
        getUserUnsecret?.user_id ? "update" : "insert"
      );
      return res.status(400).json({
        loginError: "Thông tin mật khẩu chưa chính xác",
      });
    }

    await user.updateUserClock(found?.payload[0]?.user_id, false);
    await user.deleteUserUnsecret(found?.payload[0]?.user_id);
    req.session.userID = found?.payload[0]?.user_id;
    req.session.role = "user";
    res.send({
      success: true,
      status: "Đăng nhập tài khoản thành công",
      login_time: found?.payload[0]?.login_time,
      role: "user",
    });
  }),

  SIGNUP: asyncHandler(async (req, res) => {
    const { fields, files } = await asyncBusboy(req);
    const { userName, email, phone, birthday, address } = fields;
    const checkExist = await user.checkExist(email, phone);
    if (checkExist) {
      return res.status(400).json({
        success: false,
        signUpError: "Email hoặc số điện thoại đã tồn tại",
      });
    }
    const userKey = Math.floor(1000000000 + Math.random() * 9999999999);
    const password = Math.random().toString(36).slice(-6);
    const hash = bcrypt.hashSync(password, 10);
    const saveUser = await user.userSignUp(
      userName,
      email,
      phone,
      birthday,
      address,
      userKey,
      hash,
      files
    );
    if (!saveUser) {
      return res
        .status(400)
        .json({ success: false, signUpError: "Thêm tài khoản thất bại" });
    }
    const sendMailResult = await sendMail.SEND_MAIL(email, userKey, password);
    if (!sendMailResult) {
      return res.send({
        success: true,
        status: "Đăng kí tài khoản thành công",
        payload: { userName: userName, password },
      });
    }
    res.send({ success: true, status: "Đăng kí tài khoản thành công" });
  }),

  GET_CHANGE_PASSWORD: asyncHandler(async (req, res) => {
    if (req.session.userID) {
      const uerLoginTime = await user.getLoginTime(req.session.userID);
      res.render("auth/change-password", { loginTime: uerLoginTime });
    } else {
      res.render("auth/login");
    }
  }),

  CHANGE_PASSWORD: asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { userID } = req.session;
    const loginTime = await user.getLoginTime(userID);

    if (parseInt(loginTime) === 0) {
      const hash = bcrypt.hashSync(newPassword, 10);
      const updatePasswordResult = await user.updateUserPassword(userID, hash);
      if (updatePasswordResult) {
        return res.send({
          success: true,
          status: "Thay đổi mật khẩu thành công",
        });
      }
      res.status(400).json({
        success: false,
        changePasswordError: "Thay đổi mật khẩu thất bại",
      });
    } else {
      const checkPassword = await userMiddleware.checkUserPassword(
        userID,
        oldPassword
      );

      if (!checkPassword) {
        return res.status(400).json({
          success: false,
          changePasswordError: "Mật khẩu cũ không chính xác",
        });
      }

      const hash = bcrypt.hashSync(newPassword, 10);
      const updatePasswordResult = await user.updateUserPassword(userID, hash);
      if (updatePasswordResult) {
        return res.send({
          success: true,
          status: "Thay đổi mật khẩu thành công",
        });
      }
      res.status(400).json({
        success: false,
        changePasswordError: "Thay đổi mật khẩu thất bại",
      });
    }
  }),
  GET_LIST_USERS: asyncHandler(async (req, res) => {
    const { status } = req.query;
    const { role } = req.session;
    if (role === "admin") {
      const listUser = await user.getUserList(status);
      const newListUser = listUser?.users?.map((item) => {
        const newUsr = {
          ...item,
          birthday: formatDateTime(item?.birthday),
        };

        if (item?.clock_time) {
          newUsr.clock_time = formatDateTime(newUsr.clock_time);
        }
        return newUsr;
      });

      res.render("admin/users", {
        listUser: newListUser,
        countUser: listUser?.countUser[0],
        status: status ? status : -1,
      });
    } else if (role === "user") {
      res.redirect("/");
    } else {
      res.redirect("/user/sign-in");
    }
  }),

  GET_USER_DETAIL: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.session;
    const userDetail = await user.findByUserId(userId);
    const userDetailInfo = userDetail?.payload;
    if (role === "admin") {
      if (userDetail?.payload.length)
        userDetailInfo[0].birthday = formatDateTime(userDetailInfo[0].birthday);
      res.render("admin/userDetail", {
        userDetail: userDetailInfo?.length ? userDetailInfo[0] : {},
      });
    } else if (role === "user") {
      res.redirect("/");
    } else {
      res.redirect("/user/sign-in");
    }
  }),

  CHANGE_USER_STATUS: asyncHandler(async (req, res) => {
    const { userId, userStatus } = req.body;

    const changeResult = await user.changeUserStatus(userId, userStatus);
    if (changeResult) {
      return res.send({
        success: true,
        status: "Cập nhật trạng thái thành công",
      });
    }
    res.status(400).json({
      success: false,
      updateError: "Cập nhật trạng thái thất bại",
    });
  }),

  SIGNOUT: asyncHandler(async (req, res) => {
    const { userID } = req.session;
    delete req.session.userID;
    delete req.session.role;
    res.redirect("/user/sign-in");
  }),

  GET_FORGOT_PASSWORD: asyncHandler(async (req, res) => {
    const { userID } = req.session;
    const loginTime = await getLoginTime(userID);
    if (userID) {
      if (loginTime === 0) return res.redirect("/user/change-password");
      return res.redirect("/");
    }
    res.render("auth/forgotPassword");
  }),

  FORGOT_PASSWORD: asyncHandler(async (req, res) => {
    const { email, phone, OTP, type } = req.body;
    if (!OTP?.length || type === "resend") {
      const found = await user.findByUserEmailAndPhone(email, phone);
      if (!found?.status) {
        return res.status(400).json({
          forgotPasswordError: "Email hoặc số điện thoại không tồn tại",
        });
      }
      const sendMailResult = await userMiddleware.sendOTP(
        email,
        "Gửi OTP đổi mật khẩu"
      );
      if (sendMailResult) {
        return res.send({
          success: true,
          status: "Vui lòng lấy mã OTP thông qua email của bạn",
        });
      }

      return res.status(400).json({
        success: false,
        forgotPasswordError:
          "Khôi phục mật khẩu thất bại, vui lòng thử lại sau",
      });
    } else {
      const userSecretKey = await user.getUserSecretKey(email);
      const checkVerify = Speakeasy.totp.verifyDelta({
        secret: userSecretKey,
        encoding: "base32",
        token: OTP,
        step: 60,
        window: 1,
      });
      if (checkVerify) {
        await user.changeUserLoginTime(email);
        const found = await user.findUserByEmail(email);
        req.session.userID = found?.payload[0]?.user_id;
        return res.send({
          success: true,
          status: "Mã OTP hợp lệ, mời bạn đổi thông tin mật khẩu",
          changePassword: true,
        });
      }

      return res.status(400).json({
        success: false,
        forgotPasswordError: "Mã OTP không hợp lệ",
      });
    }
  }),

  CHANGE_USER_IDENTITY: asyncHandler(async (req, res) => {
    const { fields, files } = await asyncBusboy(req);
    const { userID } = req.session;
    const changeRes = await user.changeUserIdentity(userID, files);
    if (changeRes) {
      return res.send({
        success: true,
        status: "Đã thay đổi thông tin chứng minh thành công",
      });
    }
    res.status(400).json({
      success: false,
      changeIdentityError: "Thay đổi thông tin chứng minh thất bại",
    });
  }),

  CHANGE_USER_CLOCK: asyncHandler(async (req, res) => {
    const { userId, status } = req.body;
    const clockResult = await user.updateUserClock(userId, status);
    const deleteUnsecret = await user.deleteUserUnsecret(userId);

    if (clockResult && deleteUnsecret) {
      return res.send({
        success: true,
        status: "Mở khoá cho khách hàng thành công",
      });
    }
    return res.status(400).json({
      success: false,
      error: "Xảy ra lỗi trong quá trình cập nhật thông tin",
    });
  }),

  GET_USER_BY_PHONE: asyncHandler(async (req, res) => {
    const { phone } = req.query;

    const userInfo = await user.findByUserPhone(phone);
    if (userInfo?.status) {
      return res.send({
        success: true,
        payload: {
          name: userInfo?.payload[0]?.name,
          email: userInfo?.payload[0]?.email,
          userId: userInfo?.payload[0]?.user_id,
        },
        status: "Lấy thông tin khách hàng thành công",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Thông tin người dùng không tồn tại",
      });
    }
  }),
};
