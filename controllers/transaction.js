const asyncHandler = require("express-async-handler");
const transactionMiddleware = require("../middlewares/transaction");
const transactionModel = require("../model/transaction");
const userModel = require("../model/users");
const { getLoginTime } = require("../model/users");
const { formatDateTime } = require("../utils/util");
const userMiddleware = require("../middlewares/users");
const SMALLEST_AMOUNT_NOT_APPROVAL = 5000000;
const Speakeasy = require("speakeasy");

module.exports = {
  USER_RECHARGE: asyncHandler(async (req, res) => {
    const { cardNumber, expiredDate, cvcNumber, moneyChargeMoney } = req.body;

    const userStatus = await userModel.getUserStatus(req?.session?.userID);

    if (userStatus !== 1) {
      return res.status(400).json({
        status: false,
        error: "Bạn không thể thực hiện giao dịch với trạng thái hiện tại",
      });
    }

    const checkCard = transactionMiddleware.checkRechargeValidateCard(
      cardNumber,
      expiredDate,
      cvcNumber,
      moneyChargeMoney
    );

    if (!checkCard?.status) {
      return res.status(400).json(checkCard);
    }

    const saveUserTransaction = await transactionModel.addUserTransaction(
      req?.session?.userID,
      `+${moneyChargeMoney}`,
      "Nạp tiền vào ví",
      "recharge",
      Number(moneyChargeMoney) >= SMALLEST_AMOUNT_NOT_APPROVAL ? false : true
    );
    if (Number(moneyChargeMoney) < SMALLEST_AMOUNT_NOT_APPROVAL) {
      const userAmount = await transactionModel.getUserAmount(
        req?.session?.userID
      );
      await transactionModel.updateUserAmount(
        req?.session?.userID,
        Number(userAmount) + Number(moneyChargeMoney)
      );
    }
    return res.send({
      success: true,
      status: "Nạp tiền vào tài khoản thành công",
    });
  }),

  USER_WITHDRAW: asyncHandler(async (req, res) => {
    const {
      cardNumber,
      expiredDate,
      cvcNumber,
      withdrawMoney,
      withdrawMoneyNote,
    } = req.body;

    const userStatus = await userModel.getUserStatus(req?.session?.userID);

    if (userStatus !== 1) {
      return res.status(400).json({
        status: false,
        error: "Bạn không thể thực hiện giao dịch với trạng thái hiện tại",
      });
    }

    const checkCard = transactionMiddleware.checkWithdrawValidateCard(
      cardNumber,
      expiredDate,
      cvcNumber,
      withdrawMoney,
      withdrawMoneyNote
    );

    if (!checkCard?.status) {
      return res.status(400).json(checkCard);
    }

    const userAmount = await transactionModel.getUserAmount(
      req?.session?.userID
    );

    if (
      Number(withdrawMoney) + Number(withdrawMoney) * 0.05 >
      Number(userAmount)
    ) {
      return res.status(400).json({
        status: false,
        error: "Số tiền cần rút lớn hơn số tiền hiện tại của bạn",
      });
    }

    const countUserTodayTransaction =
      await transactionModel.countUserTodayTransaction("withdraw");
    if (countUserTodayTransaction >= 2) {
      return res.status(400).json({
        status: false,
        error: "Bạn chỉ có thể tạo tối đa 2 giao dịch rút tiền trong 1 ngày",
      });
    }

    await transactionModel.addUserTransaction(
      req?.session?.userID,
      `-${Number(withdrawMoney) + Number(withdrawMoney) * 0.05}`,
      withdrawMoneyNote,
      "withdraw",
      Number(withdrawMoney) >= SMALLEST_AMOUNT_NOT_APPROVAL ? false : true
    );

    if (Number(withdrawMoney) < SMALLEST_AMOUNT_NOT_APPROVAL) {
      await transactionModel.updateUserAmount(
        req?.session?.userID,
        Number(userAmount) -
          (Number(withdrawMoney) + Number(withdrawMoney) * 0.05)
      );
    }
    return res.send({
      success: true,
      status: "Nạp tiền vào tài khoản thành công",
    });
  }),

  GET_LIST_TRANSACTION: asyncHandler(async (req, res) => {
    const { role } = req.session;
    if (role === "admin") {
      const listTransaction = await transactionModel.getListTransaction();
      listTransaction.sort(function (a, b) {
        return new Date(a.transaction_time) - new Date(b.transaction_time);
      });
      for (let i = 0; i < listTransaction?.length; i++) {
        listTransaction[i].transaction_time = formatDateTime(
          listTransaction[i].transaction_time
        );
      }
      res.render("admin/transaction", { listTransaction: listTransaction });
    } else if (role === "user") {
      res.redirect("/");
    } else {
      res.redirect("/user/sign-in");
    }
  }),

  GET_TRANSACTION_DETAIL: asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const { role } = req.session;
    if (role === "admin") {
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
      }

      return res.render("admin/transactionDetail", {
        transactionDetail: transactionDetail ? transactionDetail : {},
      });
    } else if (role === "user") {
      res.redirect("/");
    } else {
      res.redirect("/user/sign-in");
    }
  }),

  CHANGE_TRANSACTION_STATUS: asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const { status } = req.body;

    const getUser = await transactionModel.getUserFromTransactionId(
      transactionId
    );

    const transaction = await transactionModel.getTransactionById(
      transactionId
    );

    if (getUser[0]?.user_id) {
      const transactionType = transaction?.transaction_type;
      const transactionMoney = Number(
        transaction?.money_transaction.replace("-", "").replace("+", "")
      );
      const userAmount = getUser[0]?.amount;

      if (transactionType === "withdraw" || transactionType === "recharge") {
        if (transactionType === "withdraw") {
          if (
            userAmount <
            Number(transactionMoney) + Number(transactionMoney) * 0.05
          ) {
            return res.status(400).json({
              status: false,
              error:
                "Số tiền trong tài khoản khách hàng không đủ để thực hiện giao dịch này",
            });
          }
        }

        const updateAmountRes = await transactionModel.updateUserAmount(
          getUser[0]?.user_id,
          transactionType === "withdraw"
            ? Number(userAmount) -
                Number(transactionMoney)
            : transactionType === "recharge" &&
                Number(userAmount) + Number(transactionMoney)
        );

        const updateStatusRes = await transactionModel.updateTransactionStatus(
          transactionId,
          status
        );

        return res.send({
          success: true,
          status: "Bạn đã cập nhật trạng thái giao dịch thành công",
        });
      }

      //if transfer type = 'transfer'
      const updateStatusRes = await transactionModel.updateTransactionStatus(
        transactionId,
        status
      );

      const transfer = await transactionModel.getTransferByTransactionId(
        transactionId
      );
      const receiverAmount = await transactionModel.getUserAmount(
        transfer?.receiver_id
      );
      const transferFeeBearer = transfer?.transfer_fee_bearer;

      if (transferFeeBearer === "receiver") {
        if (Number(userAmount) < Number(transactionMoney)) {
          return res.status(400).json({
            status: false,
            error:
              "Số tiền trong tài khoản khách hàng không đủ để thực hiện giao dịch này",
          });
        }
      } else if (transferFeeBearer === "mover") {
        if (
          Number(userAmount) <
          Number(transactionMoney) + Number(transactionMoney) * 0.05
        ) {
          return res.status(400).json({
            status: false,
            error:
              "Số tiền trong tài khoản khách hàng không đủ để thực hiện giao dịch này",
          });
        }
      }
      let newUserAmount = 0;
      let newReceiverAmount = 0;

      if (transferFeeBearer === "receiver") {
        newUserAmount = Number(userAmount) - Number(transactionMoney);
        newReceiverAmount =
          Number(receiverAmount) +
          Number(transactionMoney) -
          Number(transactionMoney) * 0.05;
      } else if (transferFeeBearer === "mover") {
        newUserAmount =
          Number(userAmount) -
          Number(transactionMoney) -
          Number(transactionMoney) * 0.05;
        newReceiverAmount = Number(receiverAmount) + Number(transactionMoney);
      }
      await transactionModel.updateUserAmount(
        getUser[0]?.user_id,
        Number(newUserAmount)
      );

      await transactionModel.updateUserAmount(
        transfer?.receiver_id,
        Number(newReceiverAmount)
      );
      return res.send({
        success: true,
        status: "Giao dịch thành công",
      });
    }
  }),

  SEND_OTP_TRANSFER: asyncHandler(async (req, res) => {
    const { moneyTransfer, transferContent, transferFeeBearer, bearerId } =
      req.body;
    const { userID } = req.session;
    const userDetail = await userModel.findByUserId(userID);

    if (userDetail?.payload[0]?.status !== 1) {
      return res.status(400).json({
        status: false,
        error: "Bạn không thể thực hiện giao dịch với trạng thái hiện tại",
      });
    }

    if (Number(bearerId) === Number(userID)) {
      return res.status(400).json({
        success: false,
        error: "Bạn không thể chuyển khoản cho tài khoản của mình",
      });
    }
    if (userDetail?.status) {
      const userAmount = await transactionModel.getUserAmount(
        req?.session?.userID
      );
      let totalMoney = 0;

      if (transferFeeBearer === "mover") {
        totalMoney = Number(moneyTransfer) + Number(moneyTransfer) * 0.05;
      } else {
        totalMoney = Number(moneyTransfer);
      }

      if (Number(userAmount) < totalMoney) {
        return res.status(400).json({
          success: false,
          error: "Số tiền trong tài khoản không đủ để thực hiện giao dịch",
        });
      } else {
        const sendMailResult = await userMiddleware.sendOTP(
          userDetail?.payload[0]?.email,
          "Gửi OTP xác nhận chuyển khoản"
        );
        if (sendMailResult) {
          req.session.transferInfo = {
            moneyTransfer,
            transferContent,
            transferFeeBearer,
            bearerId,
          };
          return res.send({
            success: true,
            status: "Vui lòng lấy mã OTP thông qua email của bạn",
          });
        }
      }
    }
    return res.status(400).json({
      success: false,
      error: "Xảy ra lỗi trong quá trình xử lí thông tin",
    });
  }),

  CONFIRM_OTP_TRANSFER: asyncHandler(async (req, res) => {
    const { OTP } = req.body;
    const { moneyTransfer, transferContent, transferFeeBearer, bearerId } =
      req.session.transferInfo;
    const { userID } = req.session;
    const userDetail = await userModel.findByUserId(userID);
    const userSecretKey = await userModel.getUserSecretKey(
      userDetail?.payload[0]?.email
    );
    const checkVerify = Speakeasy.totp.verifyDelta({
      secret: userSecretKey,
      encoding: "base32",
      token: OTP.trim(),
      step: 60,
      window: 1,
    });

    if (checkVerify) {
      const transactionPayload = await transactionModel.addUserTransaction(
        userID,
        `${moneyTransfer}`,
        `${transferContent}`,
        "transfer",
        Number(moneyTransfer) >= SMALLEST_AMOUNT_NOT_APPROVAL ? false : true
      );

      const transfersDetailPayload = await transactionModel.addTransferDetail(
        transactionPayload?.transferId,
        bearerId,
        Number(moneyTransfer) * 0.05,
        transferFeeBearer
      );
      const userAmount = await transactionModel.getUserAmount(userID);
      const receiverAmount = await transactionModel.getUserAmount(bearerId);

      if (Number(moneyTransfer) < SMALLEST_AMOUNT_NOT_APPROVAL) {
        let newUserAmount = 0;
        let newReceiverAmount = 0;
        if (transferFeeBearer === "receiver") {
          newUserAmount = Number(userAmount) - Number(moneyTransfer);
          newReceiverAmount =
            Number(receiverAmount) +
            Number(moneyTransfer) -
            Number(moneyTransfer) * 0.05;
        } else if (transferFeeBearer === "mover") {
          newUserAmount =
            Number(userAmount) -
            Number(moneyTransfer) -
            Number(moneyTransfer) * 0.05;
          newReceiverAmount = Number(receiverAmount) + Number(moneyTransfer);
        }
        await transactionModel.updateUserAmount(userID, Number(newUserAmount));

        await transactionModel.updateUserAmount(
          bearerId,
          Number(newReceiverAmount)
        );
        return res.send({
          success: true,
          status: "Chuyển khoản thành công",
        });
      }

      return res.send({
        success: true,
        status: "Chuyển khoản thành công, giao dịch của bạn đang được duyệt",
      });
    }
    return res.status(400).json({
      success: false,
      error: "Mã OTP không hợp lệ",
    });
  }),

  RESEND_OTP: asyncHandler(async (req, res) => {
    const { userID } = req.session;
    const userDetail = await userModel.findByUserId(userID);

    const sendMailResult = await userMiddleware.sendOTP(
      userDetail?.payload[0]?.email,
      "Gửi OTP xác nhận chuyển khoản"
    );

    if (sendMailResult) {
      return res.send({
        success: true,
        status: "Vui lòng lấy mã OTP thông qua email của bạn",
      });
    }

    return res.status(400).json({
      success: false,
      error: "Gửi OTP thất bại",
    });
  }),

  UNACTIVE_TRANSACTION: asyncHandler(async (req, res) => {
    const {transactionId} = req.body

    const updateResult = await transactionModel.updateTransactionStatus(transactionId, 2)

    if ( updateResult ){
      return res.send({
        success: true,
        status: "Cập nhật trạng thái thành công",
      });
    }

    return res.status(400).json({
      success: false,
      error: "Cập nhật trạng thái thất bại",
    });
  }),
};
