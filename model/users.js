const { mysql } = require("../config/connect");
const fs = require("fs");

module.exports = {
  checkExist: async (email, phone) => {
    try {
      const result = await mysql.query(
        `SELECT * FROM user WHERE email='${email}' OR phone='${phone}'`
      );
      if (result?.length) {
        return true;
      }
      return false;
    } catch (error) {
      console.log("check user exist error >>>> ", error);
      return false;
    }
  },

  userSignUp: async (
    userName,
    email,
    phone,
    birthday,
    address,
    userKey,
    password,
    files
  ) => {
    try {
      const birthd = new Date(birthday)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const frontCard = files?.find(
        (item) => item?.fieldname === "userFrontIdentityCard"
      );
      const backCard = files?.find(
        (item) => item?.fieldname === "userBackIdentityCard"
      );
      const convertFrontCard = frontCard?.path
        ? fs.readFileSync(frontCard.path, { encoding: "base64" })
        : "";
      const convertBackCard = backCard?.path
        ? fs.readFileSync(backCard.path, { encoding: "base64" })
        : "";

      const result =
        await mysql.query(`INSERT INTO user(name, email, phone, address, birthday, status, login_time, username, password, front_identity_card, back_identity_card, amount, clock, createday) 
      VALUES('${userName}', '${email}', '${phone}', '${address}', '${birthd}', 0, 0, '${userKey}', '${password}', '${convertFrontCard}', '${convertBackCard}', 0, false, now())`);
      if (result) {
        return true;
      }
      return false;
    } catch (error) {
      console.log("user sign up error >>>> ", error);
      return false;
    }
  },

  findByUsername: async (username) => {
    try {
      const user = await mysql.query(
        `SELECT * FROM user WHERE username='${username}'`
      );
      if (user?.length) {
        return {
          status: true,
          payload: user,
        };
      }
      return { status: false };
    } catch (error) {
      return { status: false };
    }
  },

  findByUserPhone: async (phone) => {
    try {
      const user = await mysql.query(
        `SELECT * FROM user WHERE phone='${phone}'`
      );
      if (user?.length) {
        return {
          status: true,
          payload: user,
        };
      }
      return { status: false };
    } catch (error) {
      return { status: false };
    }
  },

  findByUserId: async (userID) => {
    try {
      const user = await mysql.query(
        `SELECT * FROM user WHERE user_id='${userID}'`
      );
      if (user?.length) {
        return {
          status: true,
          payload: user,
        };
      }
      return { status: false };
    } catch (error) {
      return { status: false };
    }
  },

  findUserByEmail: async (email) => {
    try {
      const user = await mysql.query(
        `SELECT * FROM user WHERE email='${email}'`
      );
      if (user?.length) {
        return {
          status: true,
          payload: user,
        };
      }
      return { status: false };
    } catch (error) {
      return { status: false };
    }
  },

  findByUserEmailAndPhone: async (email, phone) => {
    try {
      const user = await mysql.query(
        `SELECT * FROM user WHERE email='${email}' AND phone='${phone}'`
      );
      if (user?.length) {
        return {
          status: true,
        };
      }
      return { status: false };
    } catch (error) {
      return { status: false };
    }
  },

  getLoginTime: async (userId) => {
    try {
      const loginTime = await mysql.query(
        `SELECT login_time FROM user WHERE user_id='${userId}'`
      );
      if (loginTime?.length) {
        return loginTime[0].login_time;
      }
      return 1;
    } catch (error) {
      return 1;
    }
  },

  updateUserPassword: async (userID, hash) => {
    try {
      const updateRes = await mysql.query(
        `UPDATE user SET password='${hash}', login_time = 1 WHERE user_id='${userID}'`
      );
      if (updateRes) return true;
      return false;
    } catch (error) {
      return false;
    }
  },

  getUserList: async (status) => {
    try {
      let listUser = [];
      const countUserAllQuery = `SELECT COUNT(user_id) FROM user`;
      const countUserNotConfirmQuery = `SELECT COUNT(user_id) FROM user WHERE status=0`;
      const countUserConfirmQuery = `SELECT COUNT(user_id) FROM user WHERE status=1`;
      const countUserClockQuery = `SELECT COUNT(user_id) FROM user WHERE status=2`;
      const countUserUpdateInfoQuery = `SELECT COUNT(user_id) FROM user WHERE status=3`;
      const countUserAlwayClockQuery = `SELECT COUNT(user_id) FROM user WHERE clock=true`;

      if (status) {
        if (Number(status) <= 3) {
          listUser = await mysql.query(
            `SELECT user_id, name, email, phone, address, birthday, front_identity_card, back_identity_card, login_time, status FROM user WHERE status=${Number(
              status
            )} ORDER BY createday ASC`
          );
        } else if (Number(status) === 4) {
          listUser = await mysql.query(
            `SELECT usr.user_id, usr.name, usr.email, usr.phone, usr.address, usr.birthday, usr.front_identity_card, usr.back_identity_card, usr.login_time, usr.status, ulu.alway_lock_time as clock_time FROM user usr JOIN user_login_unsecret ulu ON usr.user_id = ulu.user_id WHERE clock=true ORDER BY ulu.alway_lock_time ASC`
          );
        }
      } else {
        listUser = await mysql.query(
          `SELECT user_id, name, email, phone, address, birthday, front_identity_card, back_identity_card, login_time, status FROM user ORDER BY createday ASC`
        );
      }

      const countUser = await mysql.query(
        `SELECT (${countUserAllQuery}) AS all_size, (${countUserNotConfirmQuery}) AS notconfirm_size, (${countUserConfirmQuery}) AS confirm_size, (${countUserClockQuery}) AS clock_size, (${countUserUpdateInfoQuery}) AS updateinfo_size, (${countUserAlwayClockQuery}) AS alwayclock_size`
      );
      if (listUser?.length)
        return {
          users: listUser,
          countUser: countUser,
        };
      return {
        users: [],
        countUser: countUser,
      };
    } catch (error) {
      return [];
    }
  },

  changeUserStatus: async (userId, userStatus) => {
    try {
      const changeRes = await mysql.query(
        `UPDATE user SET status=${Number(userStatus)} WHERE user_id=${Number(
          userId
        )}`
      );
      if (changeRes) return true;
      return false;
    } catch (error) {
      return false;
    }
  },

  changeUserIdentity: async (userID, files) => {
    try {
      const frontCard = files?.find(
        (item) => item?.fieldname === "userFrontIdentityCard"
      );
      const backCard = files?.find(
        (item) => item?.fieldname === "userBackIdentityCard"
      );
      const convertFrontCard = frontCard?.path
        ? await fs.readFileSync(frontCard.path, { encoding: "base64" })
        : "";
      const convertBackCard = backCard?.path
        ? await fs.readFileSync(backCard.path, { encoding: "base64" })
        : "";

      const changeRes = await mysql.query(
        `UPDATE user SET status=0, front_identity_card='${convertFrontCard}', back_identity_card='${convertBackCard}'  WHERE user_id=${Number(
          userID
        )}`
      );
      if (changeRes) return true;
      return false;
    } catch (error) {
      return false;
    }
  },

  getUserSecretKey: async (email) => {
    try {
      const find = await mysql.query(
        `SELECT * FROM user_otp_secret WHERE user_email='${email}'`
      );
      if (find?.length) {
        return find[0]?.secret_key;
      }
      return "";
    } catch (error) {
      return "";
    }
  },

  saveUserSecretKey: async (email, secretKey) => {
    try {
      const result = await mysql.query(
        `INSERT INTO user_otp_secret(user_email, secret_key) VALUES('${email}', '${secretKey}')`
      );
      if (result) return true;
      return false;
    } catch (error) {
      return false;
    }
  },

  changeUserLoginTime: async (email) => {
    try {
      const result = await mysql.query(
        `UPDATE user SET login_time= 0 WHERE email='${email}'`
      );
      if (result) return true;
      return false;
    } catch (error) {
      return false;
    }
  },

  getUserUnsecret: async (userId) => {
    try {
      const find = await mysql.query(
        `SELECT * FROM user_login_unsecret WHERE user_id='${userId}'`
      );
      if (find?.length) {
        return find[0];
      }
      return {};
    } catch (error) {
      return {};
    }
  },

  saveUserUnsecret: async (
    userId,
    not_secure_login,
    temporary_lock_time,
    alway_lock_time,
    type
  ) => {
    try {
      if (type === "insert") {
        const result = await mysql.query(
          `INSERT INTO user_login_unsecret(user_id, not_secure_login, temporary_lock_time, alway_lock_time) VALUES(${userId}, ${not_secure_login}, ${
            temporary_lock_time === "now" ? "now()" : null
          }, ${alway_lock_time === "now" ? "now()" : null})`
        );
        if (result) return true;
        return false;
      } else {
        const result = await mysql.query(
          `UPDATE user_login_unsecret SET not_secure_login=${Number(
            not_secure_login
          )}, temporary_lock_time=${
            temporary_lock_time === "now" ? "now()" : null
          }, alway_lock_time=${
            alway_lock_time === "now" ? "now()" : null
          } WHERE user_id=${Number(userId)}`
        );
        if (result) return true;
        return false;
      }
    } catch (error) {
      return false;
    }
  },

  deleteUserUnsecret: async (userId) => {
    try {
      const result = await mysql.query(
        `DELETE FROM user_login_unsecret WHERE user_id=${Number(userId)}`
      );
      if (result) return true;
      return false;
    } catch (error) {
      return false;
    }
  },

  updateUserClock: async (userId, status) => {
    try {
      const result = await mysql.query(
        `UPDATE user SET clock= ${status} WHERE user_id='${Number(userId)}'`
      );
      if (result) return true;
      return false;
    } catch (error) {
      return false;
    }
  },

  getUserStatus: async (userId) => {
    try{
      const find = await mysql.query(
        `SELECT status FROM user WHERE user_id='${userId}'`
      );
      if ( find?.length ){
        return find[0]?.status
      }
      return -1
    }catch (error) {
      return -1;
    }
  }
};
