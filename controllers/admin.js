const asyncHandler = require("express-async-handler");
const user = require("../model/users");
const { formatDateTime } = require("../utils/util");

module.exports = {
  GET_DASHBOARD: asyncHandler(async (req, res) => {
    res.redirect("admin/users")
  }),
};
