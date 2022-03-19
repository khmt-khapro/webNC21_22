const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Accounts = new Schema({
  phone : {type: String, maxlength : 255, required: true},
  email : {type: String, maxlength : 255, required: true, unique: true},
  fullname : {type: String, maxlength : 255},
  address : {type: String, maxlength : 255},
  birthday: {type: Date, trim: true},
  username : {type: String, maxlength : 255},
  password :{type: String, maxlength : 255}
},{
  timestamps : true,
});

module.exports = mongoose.model('Account', Accounts);