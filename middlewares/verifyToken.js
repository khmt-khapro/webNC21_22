const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log(req.url);
  const token = req.signedCookies.accessToken;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (req.url == "/login" || req.url == "/register") {
          next();
        } else {
          return res.redirect("/user/login");
        }
      }

      if (req.url == "/login" || req.url == "/register") {
        return res.redirect("/user");
      }

      // set info to next middleware
      req.user = user;
      next();
    });
  } else {
    return res.redirect("/user/login");
  }
};

// const isLogin = (req, res, next) => {
//   console.log(req.url);
//   const token = req.signedCookies.accessToken;
//   if (token) {
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//       if (err) return res.redirect("/user" + req.url);
//       next();
//     });
//   } else {
//     next();
//   }
// };

// const verifyTokenAndAuthorization = (req, res, next) => {
//   verifyToken(req, res, () => {
//     console.log(req.user.id, req.params.id)
//     if (req.user.id == req.params.id || req.user.isAdmin) {
//       //call next middleware in user.js
//       next()
//     } else {
//       res.status(403).json("You are not allow to do this action!")
//     }
//   })
// }

// const verifyTokenAndAdmin = (req, res, next) => {
//   verifyToken(req, res, () => {
//     console.log(req.user)
//     if (req.user.isAdmin) {
//       //call next middleware in user.js
//       next()
//     } else {
//       res.status(403).json("You are not allow to do this action!")
//     }
//   })
// }

module.exports = {
  verifyToken,
  // isLogin,
  //   verifyTokenAndAuthorization,
  //   verifyTokenAndAdmin,
};
