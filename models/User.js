const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên không thể để trống"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email không thể để trống"],
      unique: true,
    },
    phone: {
      type: String,
      // validate: {
      //   validator: function (v) {
      //     return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(v);
      //   },
      //   message: (props) => `${props.value} không phải là số điện thoại hợp lệ`,
      // },
      required: [true, "Vui lòng điền số điện thoại"],
      unique: true,
    },
    birthday: {
      type: Date,
      required: [true, "Ngày sinh không thể để trống"],
    },
    address: {
      type: String,
      required: [true, "Địa chỉ không thể để trống"],
    },
    idCard: {
      type: Array,
    },
    userName: {
      type: String,
    },
    password: {
      type: String,
      min: [6, "Mật Khẩu phải dài hơn 6 kí tự"],
    },
    firstLogin: {
      type: Boolean,
      default: true,
    },
    accountState: {
      type: String,
      enum: [
        "verified",
        "pending",
        "disabled",
        "waiting",
        "locked1m",
        "locked",
      ],
      default: "pending",
    },
    wrongPassword: {
      type: Number,
      default: 0,
    },
    abnormal: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
