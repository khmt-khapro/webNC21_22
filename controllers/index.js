const asyncHandler = require("express-async-handler");
const { getLoginTime } = require("../model/users");
const user = require("../model/users");
const transactionModel = require("../model/transaction");
const { formatDateTime } = require("../utils/util");

module.exports = {
  GET_HOME: asyncHandler(async (req, res) => {
    const { userID } = req.session;
    const { role } = req.session;

    if (role === "user") {
      const loginTime = await getLoginTime(userID);
      if (userID) {
        if (loginTime === 0) return res.redirect("/user/change-password");
        return res.render("user/home");
      }
      return res.redirect("/user/sign-in");
    } else if (role === "admin") {
      res.redirect("/admin/users");
    } else {
      res.redirect("/user/sign-in");
    }
  }),

  GET_HOME_USER_DETAIL: asyncHandler(async (req, res) => {
    const { type } = req.query;
    const { userID } = req.session;
    const loginTime = await getLoginTime(userID);
    const { role } = req.session;

    if (role === "user") {
      if (userID) {
        if (loginTime === 0) return res.redirect("/user/change-password");
        const userDetail = await user.findByUserId(userID);
        const userDetailInfo = userDetail?.payload;

        if (userDetail?.payload.length) {
          userDetailInfo[0].birthday = formatDateTime(
            userDetailInfo[0].birthday
          );
        }
        if (type == "info" || !type) {
          return res.render("user/userDetail", {
            userDetail: userDetailInfo?.length ? userDetailInfo[0] : {},
            type: type,
          });
        }

        let userTransaction = await transactionModel.getUserTransaction(userID);

        userTransaction = [...userTransaction]?.map((item) => {
          if (item?.transaction_type === 'transfer') {
            return {
              ...item,
              money_transaction:
                item?.transfer_fee_bearer === "mover"
                  ? "-" +
                    (Number(item?.money_transaction) +
                      Number(item?.transfer_fee))
                  : "-" + Number(item?.money_transaction),
            };
          }
          return { ...item };
        });

        const transferById = await transactionModel.getTransferByUserId(userID);

        if (transferById?.length) {
          const newTransfer = transferById?.map((item) => {
            return {
              ...item,
              transaction_type: "receive",
              money_transaction:
                item?.transfer_fee_bearer === "receiver"
                  ? "+" +
                    (Number(item?.money_transaction) -
                      Number(item?.transfer_fee))
                  : "+" + Number(item?.money_transaction),
            };
          });

          userTransaction.push(...newTransfer);
        }

        userTransaction.sort(function(a,b){
          return new Date(a.transaction_time) - new Date(b.transaction_time)
        });

        if (userTransaction?.length) {
          for (let i = 0; i < userTransaction?.length; i++) {
            userTransaction[i].transaction_time = formatDateTime(
              userTransaction[i].transaction_time
            );
          }
        }

        return res.render("user/userTransaction", {
          userTransaction: userTransaction,
          type: type,
        });
      }
      return res.redirect("/user/sign-in");
    } else if (role === "admin") {
      res.redirect("/admin/users");
    } else {
      res.redirect("/user/sign-in");
    }
  }),

  GET_USER_TRANSACTION_DETAIL: asyncHandler(async (req, res) => {
    const { userID } = req.session;
    const { transactionId } = req.params;
    const { role } = req.session;
    const loginTime = await getLoginTime(userID);

    if (role === "user") {
      if (userID) {
        if (loginTime === 0) return res.redirect("/user/change-password");
        const transactionDetail = await transactionModel.getTransactionById(
          transactionId
        );

        if (transactionDetail?.transaction_time) {
          transactionDetail.transaction_time = formatDateTime(
            transactionDetail.transaction_time
          );
        }

        if (transactionDetail?.transaction_type === "transfer") {
          const transferDetail =
            await transactionModel.getTransferByTransactionId(transactionId);

          if (transferDetail?.transaction_id) {
            transactionDetail.receiver_name = transferDetail?.receiver_name;
            transactionDetail.transfer_fee_bearer =
              transferDetail?.transfer_fee_bearer;
          }

          if (transactionDetail?.user_id !== Number(userID)) {
            transactionDetail.money_transaction =
            transferDetail?.transfer_fee_bearer === "receiver"
                ? "+" +
                  (Number(transactionDetail?.money_transaction) -
                    Number(transferDetail?.transfer_fee))
                : "+" + Number(transactionDetail?.money_transaction);
            transactionDetail.transaction_type = "receive";

          }else{
            transactionDetail.money_transaction =
            transferDetail?.transfer_fee_bearer === "mover"
                  ? "-" +
                    (Number(transactionDetail?.money_transaction) +
                      Number(transferDetail?.transfer_fee))
                  : "-" + Number(transactionDetail?.money_transaction)
          }
        }
        return res.render("user/userTransactionDetail", {
          transactionDetail: transactionDetail ? transactionDetail : {},
        });
      }
      return res.redirect("/user/sign-in");
    } else if (role === "admin") {
      res.redirect("/admin/users");
    } else {
      res.redirect("/user/sign-in");
    }
  }),
};
