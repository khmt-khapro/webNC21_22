const { validateExpiredData } = require("../utils/util");
const { VALID_CARD, CARD_WITHDRAW } = require("../utils/util.enum");

module.exports = {
  checkRechargeValidateCard: (
    cardNumber,
    expiredDate,
    cvcNumber,
    moneyChargeMoney
  ) => {
    const newCardNumber = cardNumber
      ?.toString()
      ?.trim()
      ?.split(".")
      .join("")
      .replace(/\s/g, "");
    const findCardNumber = VALID_CARD?.find(
      (item) => item?.cardNumber === newCardNumber
    );

    const expiredMonth = (" " + expiredDate).slice(1).substring(0, 2);

    const expiredYear = (" " + expiredDate).slice(1).substring(3);

    if (findCardNumber) {
      const findCardNumberMonth = (" " + findCardNumber?.expiredDate)
        .slice(1)
        .substring(0, 2);
      const findCardNumberYear = (" " + findCardNumber?.expiredDate)
        .slice(1)
        .substring(3);

      if (cvcNumber !== findCardNumber?.cvv) {
        return {
          status: false,
          error: "Mã CVV không hợp lệ",
        };
      }

      if (
        Number(findCardNumberMonth) !== Number(expiredMonth) &&
        Number(expiredYear) !== Number(findCardNumberYear)
      ) {
        return {
          status: false,
          error: "Thông tin ngày hết hạn không trùng khớp",
        };
      }

      if (!validateExpiredData(findCardNumberMonth, findCardNumberYear)) {
        return {
          status: false,
          error: "Thẻ đã hết hạn, vui lòng điền thông tin thẻ khác",
        };
      }

      if (findCardNumber?.moneyStatus === "end") {
        return {
          status: false,
          error: "Thẻ đã hết tiền, vui lòng điền thông tin thẻ khác",
        };
      }

      if (
        typeof findCardNumber?.moneyCharge === "number" &&
        moneyChargeMoney > findCardNumber?.moneyCharge
      ) {
        return {
          status: false,
          error: `Số tiền rút tối đa của thẻ là ${findCardNumber?.moneyCharge}`,
        };
      }

      return {
        status: true,
      };
    }
    return {
      status: false,
      error: "Số thẻ không hợp lệ",
    };
  },

  checkWithdrawValidateCard: (
    cardNumber,
    expiredDate,
    cvcNumber,
    withdrawMoney,
    withdrawMoneyNote
  ) => {
    const newCardNumber = cardNumber
      ?.toString()
      ?.trim()
      ?.split(".")
      .join("")
      .replace(/\s/g, "");
    const findCardNumber = VALID_CARD?.find(
      (item) => item?.cardNumber === newCardNumber
    );

    const expiredMonth = (" " + expiredDate).slice(1).substring(0, 2);

    const expiredYear = (" " + expiredDate).slice(1).substring(3);

    if (findCardNumber) {
      if (findCardNumber?.cardNumber === CARD_WITHDRAW) {
        const findCardNumberMonth = (" " + findCardNumber?.expiredDate)
          .slice(1)
          .substring(0, 2);
        const findCardNumberYear = (" " + findCardNumber?.expiredDate)
          .slice(1)
          .substring(3);

        if (cvcNumber !== findCardNumber?.cvv) {
          return {
            status: false,
            error: "Mã CVV không hợp lệ",
          };
        }

        if (
          Number(findCardNumberMonth) !== Number(expiredMonth) &&
          Number(expiredYear) !== Number(findCardNumberYear)
        ) {
          return {
            status: false,
            error: "Thông tin ngày hết hạn không trùng khớp",
          };
        }

        return {
          status: true,
        };
      }
      return {
        status: false,
        error: "Thẻ này không được hỗ trợ để rút tiền",
      };
    }
    return {
      status: false,
      error: "Số thẻ không hợp lệ",
    };
  },
};
