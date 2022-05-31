const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID =
  "873505612669-ksp8ihdrh4spnhr3p48oe2gr8i7cfhqf.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN =
  "1//04jaBOqcCQAV5CgYIARAAGAQSNgF-L9Ir1OTLjjUvGsf1OObafCtA5xABrry6enr5WNJHTBmXznFCLQykLlZp1dU2yOSch8a_bA";

const oauth2Client = new OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

const getTransporter = async() => {
  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject();
      }
      resolve(token);
    });
  });

  return transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "mr.hieu2491@gmail.com",
      accessToken,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
    },
  })
}


module.exports = {
  SEND_MAIL: async (to, userName, password) => {
    try {   
      const transporter = await getTransporter()
      const mailOptions = {
        from: '"ELECTROLIC WALET" <mr.hieu2491@gmail.com>',
        to: to,
        subject: "Gửi thông tin tài khoản",
        html: ` 
        <div>
            <p>Bạn đang sử dụng chức năng đăng kí trên web ELECTROLIC WALET</p>
            <p>Chúng tôi xin gửi thông tin tài khoản và mật khẩu cho bạn</p>
            <p>Tài khoản: ${userName}</p>
            <p>Mật khẩu: ${password}</p>
        </div>`,
      }

      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            resolve(false);
          } else {
            resolve(true);
            console.log("Email sent: " + info.response);
          }
        });
      });
    } catch (error) {}
  },

  SEND_OTP_MAIL: async (to, otp, title) => {
    try {   
      const transporter = await getTransporter()
      const mailOptions = {
        from: '"ELECTROLIC WALET" <mr.hieu2491@gmail.com>',
        to: to,
        subject: `${title}`,
        html: ` 
        <div>
            <p>Đây là một mã bảo mật, LƯU Ý: không cung cấp mã này cho bất kì ai</p>
            <p>Mã OTP: ${otp}</p>
        </div>`,
      }

      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            resolve(false);
          } else {
            resolve(true);
            console.log("Email sent: " + info.response);
          }
        });
      });
    } catch (error) {}
  },
};
