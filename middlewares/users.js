const users = require("../model/users");
const bcrypt = require("bcrypt");
const Speakeasy = require("speakeasy");
const sendMail = require("./sendMail");
const { betweenTwoDate } = require("../utils/util");

module.exports = {
  checkUserPassword: async (userID, oldPassword) => {
    const found = await users.findByUserId(userID);
    if (!found?.status) return false;

    const isMatch = bcrypt.compareSync(
      oldPassword,
      found?.payload[0]?.password || ""
    );
    if (!isMatch) return false;
    return true;
  },

  sendOTP: async (email, emailTitle) => {
    try {
      const secretKey = Speakeasy.generateSecret({ length: 20 });
      const userSecretKey = await users.getUserSecretKey(email);
      let validSecrekKey = "";

      if (userSecretKey?.length) {
        validSecrekKey = userSecretKey;
      } else {
        validSecrekKey = JSON.stringify(secretKey);
        await users.saveUserSecretKey(email, JSON.stringify(secretKey));
      }

      const OTP = Speakeasy.totp({
        secret: validSecrekKey,
        encoding: "base32",
        step: 60,
        window: 1,
      });
      const sendMailResult = await sendMail.SEND_OTP_MAIL(
        email,
        OTP,
        emailTitle
      );
      return sendMailResult;
    } catch (error) {
      return false;
    }
  },

  checkUserUnsecret: async (userId) => {
    try {
      const getUserUnsecret = await users.getUserUnsecret(userId);
      const unsecretTime = getUserUnsecret?.not_secure_login || 0;
      const minuteBetweenTwoDate = getUserUnsecret?.temporary_lock_time
        ? betweenTwoDate(
            new Date(),
            new Date(getUserUnsecret?.temporary_lock_time)
          )
        : null;

      if (minuteBetweenTwoDate && minuteBetweenTwoDate < 60) {
        return {
          loginError:
            "Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút",
        };
      }

      if (unsecretTime === 6) {
        return {
          loginError:
            "Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ",
        };
      }

      const newUnsecretTime = unsecretTime + 1;
      
      if (newUnsecretTime <= 6) {
        if (newUnsecretTime === 3) {
          await users.saveUserUnsecret(
            userId,
            newUnsecretTime,
            "now",
            "",
            getUserUnsecret?.user_id ? "update" : "insert"
          );
          return {
            loginError:
              "Bạn bị khoá tài khoản trong 1 phút, vui lòng thử lại sau",
          };
        } else if (newUnsecretTime === 6) {
          await users.saveUserUnsecret(
            userId,
            newUnsecretTime,
            "",
            "now",
            getUserUnsecret?.user_id ? "update" : "insert"
          );
          await users.updateUserClock(userId, true);
          return {
            loginError:
              "Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ",
          };
        }
      }
    } catch (error) {
      return {
        loginError: "Thông tin mật khẩu chưa chính xác",
      };
    }
  },
};
