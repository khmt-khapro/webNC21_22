const mongoose = require("mongoose");
const assert = require("assert");

var userSchema = new mongoose.Schema({
  phone: {
    type: Number,
    validate: {
      validator: function (v) {
        return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(v);
      },
      message: (props) => `${props.value} không phải là số điện thoại hợp lệ`,
    },
    required: [true, "Vui lòng điền số điện thoại"],
  },
});

var User = mongoose.model("user", userSchema);
var user = new User();
var error;

user.phone = "03456789";
error = user.validateSync();
console.log(error.errors["phone"]);
