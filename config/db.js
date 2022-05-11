const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECT_STRING);
    console.log("Connect successfully!!!");
  } catch (err) {
    console.log(error);
    console.log("Connect failed!!!");
  }
};

module.exports = connectDB;
