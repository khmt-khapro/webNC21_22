require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRoute = require("./routes/user");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser("khait"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

app.use("/user", userRoute);

mongoose
  .connect(process.env.CONNECT_STRING)
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log("Server is started at port: " + PORT);
});
