const mailer = require("./mailer");
// email người dùng
exports.sendToUser = async (req, userName, password) => {
  // email người dùng
  const to = req.body.email;
  const subject = "Thông tin đăng nhập";
  const body = `
    <h3>Thông tin account</h3>
    <p>Username: ${userName}</p>
    <p>Password: ${password}</p>
    <p>Đăng nhập tại đây: <a href="http://localhost:3000/user/login">Bấm vào đây</a></p>
  `;
  await mailer.sendMail(to, subject, body);
};
