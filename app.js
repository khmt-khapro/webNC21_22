require("dotenv").config();
const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const viewEngine = require("./config/viewsEngine");
const connectDB = require("./config/db");
const initRoute = require("./routes");
const app = express();

const PORT = process.env.PORT || 3000;

viewEngine(app);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

initRoute(app);

connectDB();
app.listen(PORT, () => {
  console.log("Server is started at port: " + PORT);
});
