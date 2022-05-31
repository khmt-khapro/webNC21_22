(function ($) {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    for (const el of document.querySelectorAll("[placeholder][data-slots]")) {
      const pattern = el.getAttribute("placeholder"),
        slots = new Set(el.dataset.slots || "_"),
        prev = ((j) =>
          Array.from(pattern, (c, i) => (slots.has(c) ? (j = i + 1) : j)))(0),
        first = [...pattern].findIndex((c) => slots.has(c)),
        accept = new RegExp(el.dataset.accept || "\\d", "g"),
        clean = (input) => {
          input = input.match(accept) || [];
          return Array.from(pattern, (c) =>
            input[0] === c || slots.has(c) ? input.shift() || c : c
          );
        },
        format = () => {
          const [i, j] = [el.selectionStart, el.selectionEnd].map((i) => {
            i = clean(el.value.slice(0, i)).findIndex((c) => slots.has(c));
            return i < 0
              ? prev[prev.length - 1]
              : back
              ? prev[i - 1] || first
              : i;
          });
          el.value = clean(el.value).join``;
          el.setSelectionRange(i, j);
          back = false;
        };
      let back = false;
      el.addEventListener("keydown", (e) => (back = e.key === "Backspace"));
      el.addEventListener("input", format);
      el.addEventListener("focus", format);
      el.addEventListener(
        "blur",
        () => el.value === pattern && (el.value = "")
      );
    }
  });

  jQuery(document).ready(function ($) {
    $("#signupButton").click(function () {
      $(".validSuccess.success").empty();
      $(".validSuccess").removeClass("success");
      $(".validError.error").empty();
      $(".validError").removeClass("error");

      let valid = true;
      //user_name
      const userName = $("#loginName").val();
      if (userName?.trim()?.length <= 5) {
        displayValidate(
          "#validationLoginName",
          "Họ tên không được dưới 5 kí tự"
        );
        valid = false;
      } else {
        removeValidate("#validationLoginName");
      }

      //user_email
      const email = $("#loginEmail").val();
      if (
        !email
          .trim()
          .match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )
      ) {
        displayValidate("#validationLoginEmail", "Email sai định dạng");
        valid = false;
      } else {
        removeValidate("#validationLoginEmail");
      }

      //user_phone
      const phone = $("#loginPhone").val();
      if (!phone.trim().match(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/)) {
        displayValidate("#validationLoginPhone", "Số điện thoại sai định dạng");
        valid = false;
      } else {
        removeValidate("#validationLoginPhone");
      }

      //user_birthday
      const birthday = $("#loginBirthday").val();
      if (!birthday) {
        displayValidate(
          "#validationLoginBirthday",
          "Ngày sinh không được để trống"
        );
        valid = false;
      } else {
        removeValidate("#validationLoginBirthday");
      }

      //user_address
      const userAddress = $("#loginAddress").val();
      if (userAddress?.trim()?.length <= 5) {
        displayValidate(
          "#validationLoginAddress",
          "Địa chỉ không được dưới 5 kí tự"
        );
        valid = false;
      } else {
        removeValidate("#validationLoginAddress");
      }

      //user front identity card
      const userFrontIdentityCard = $("#loginFrontcmnd")[0].files[0];
      if (!userFrontIdentityCard) {
        displayValidate(
          "#validationLoginFrontcmnd",
          "Hình ảnh chứng minh mặt trước không được bỏ trống"
        );
        valid = false;
      } else {
        removeValidate("#validationLoginFrontcmnd");
      }

      //user back identity card
      const userBackIdentityCard = $("#loginBackcmnd")[0].files[0];
      if (!userBackIdentityCard) {
        displayValidate(
          "#validationLoginBackcmnd",
          "Hình ảnh chứng minh mặt sau không được bỏ trống"
        );
        valid = false;
      } else {
        removeValidate("#validationLoginBackcmnd");
      }

      if (valid) {
        const formData = new FormData();
        formData.append("userName", userName);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("birthday", birthday);
        formData.append("address", userAddress);
        formData.append("userFrontIdentityCard", userFrontIdentityCard);
        formData.append("userBackIdentityCard", userBackIdentityCard);
        $.ajax({
          type: "POST",
          url: "/user/sign-up",
          processData: false,
          contentType: false,
          data: formData,
          success: function (data) {
            if (data.success) {
              $(".validSuccess")
                .addClass("success")
                .append(`<i class="far fa-check-circle"></i> ${data.status}`);
              alert(
                "Bạn đã đăng kí thành công, chuyển hướng sang trang đăng nhập sau 1 giây"
              );
              setTimeout(() => {
                window.location.href = "/user/sign-in";
              }, 1000);
            }
          },
          error: function (res) {
            if (res.responseJSON.signUpError) {
              $(".validError")
                .addClass("error")
                .append(
                  `<i class="far fa-check-circle"></i> ${res.responseJSON.signUpError}`
                );
            }
          },
        });
      }
    });

    //login
    $("#signinButton").click(function () {
      $(".validSuccess.success").empty();
      $(".validSuccess").removeClass("success");
      $(".validError.error").empty();
      $(".validError").removeClass("error");
      let valid = true;
      //user_name
      const userName = $("#loginUsername").val();
      if (!userName?.trim()?.length) {
        displayValidate(
          "#validationLoginUsername",
          "Tên đăng nhập không được bỏ trống"
        );
        valid = false;
      } else {
        removeValidate("#validationLoginUsername");
      }

      //password
      const password = $("#loginPassword").val();
      if (!password?.trim()?.length) {
        displayValidate(
          "#validationLoginPassword",
          "Mật khẩu không được bỏ trống"
        );
        valid = false;
      } else {
        removeValidate("#validationLoginPassword");
      }

      if (valid) {
        $.ajax({
          type: "POST",
          url: "/user/sign-in",
          data: {
            userName: userName,
            password: password,
          },
          success: function (data) {
            if (data.success) {
              if (data?.login_time === 0) {
                alert(
                  "Bạn đã đăng nhập thành công, Vui lòng đổi thông tin tài khoản trong lần đầu đăng nhập"
                );
                setTimeout(() => {
                  window.location.href = "/user/change-password";
                }, 1000);
              } else {
                if (data?.role === "user") {
                  setTimeout(() => {
                    window.location.href = "/";
                  }, 1000);
                } else {
                  setTimeout(() => {
                    window.location.href = "/admin/users";
                  }, 1000);
                }
              }
            }
          },
          error: function (res) {
            if (res.responseJSON.loginError) {
              $(".validError")
                .addClass("error")
                .append(
                  `<i class="far fa-check-circle"></i> ${res.responseJSON.loginError}`
                );
            }
          },
        });
      }
    });

    //change password
    $("#changePasswordButton").click(function () {
      $(".validSuccess.success").empty();
      $(".validSuccess").removeClass("success");
      $(".validError.error").empty();
      $(".validError").removeClass("error");
      let valid = true;
      //old_password
      const oldPassword = $("#oldPassword").length;
      if (oldPassword !== 0) {
        if (!$("#oldPassword")?.val()?.trim()?.length) {
          displayValidate(
            "#validationOldPassword",
            "Tên đăng nhập không được bỏ trống"
          );
          valid = false;
        } else {
          removeValidate("#validationOldPassword");
        }
      }
      //new_password
      const newPassword = $("#newPassword").val();
      if (!newPassword?.trim()?.length) {
        displayValidate(
          "#validationNewPassword",
          "Mật khẩu mới không được bỏ trống"
        );
        valid = false;
      } else {
        removeValidate("#validationNewPassword");
      }

      //confirm_new_password
      const confirmNewPassword = $("#confirmNewPassword").val();
      if (confirmNewPassword !== newPassword) {
        displayValidate(
          "#validationConfirmNewPassword",
          "Mật khẩu nhập lại không trùng với mật khẩu mới"
        );
        valid = false;
      } else {
        removeValidate("#validationConfirmNewPassword");
      }
      if (valid) {
        $.ajax({
          type: "PUT",
          url: "/user/change-password",
          data: {
            oldPassword: oldPassword !== 0 ? $("#oldPassword")?.val() : null,
            newPassword: newPassword,
            loginTime: oldPassword === 0 ? 0 : 1,
          },
          success: function (data) {
            if (data.success) {
              alert("Bạn đã thay đổi mật khẩu thành công");
              setTimeout(() => {
                window.location.href = "/";
              }, 1000);
            }
          },
          error: function (res) {
            if (res.responseJSON.changePasswordError) {
              $(".validError")
                .addClass("error")
                .append(
                  `<i class="far fa-check-circle"></i> ${res.responseJSON.changePasswordError}`
                );
            }
          },
        });
      }
    });

    $(".admin-page-layout #toggle-left-menu").click(function () {
      if ($(".admin-page-layout #left-menu").hasClass("small-left-menu")) {
        $(".admin-page-layout #left-menu").removeClass("small-left-menu");
      } else {
        $(".admin-page-layout #left-menu").addClass("small-left-menu");
      }
      $(".admin-page-layout #logo").toggleClass("small-left-menu");
      $(".admin-page-layout #page-container").toggleClass("small-left-menu");
      $(".admin-page-layout #header .header-left").toggleClass(
        "small-left-menu"
      );

      $(".admin-page-layout #logo .big-logo").toggle("300");
      $(".admin-page-layout #logo .small-logo").toggle("300");
      $(".admin-page-layout #logo").toggleClass("p-0 pl-1");
    });

    $("#openUpdateUserStatusModal").click(function () {
      $("#updateUserStatusModal").modal();
    });

    $("#changeConfirmAccount").click(function () {
      $(this).css("border", "1px solid red");
      $("#changeCancelAccount").css("border", "none");
      $("#changeAddInfoAccount").css("border", "none");
      $("#confirmChangeUserAccountStatus").attr("data-status", 1);
    });

    $("#changeCancelAccount").click(function () {
      $(this).css("border", "1px solid red");
      $("#changeConfirmAccount").css("border", "none");
      $("#changeAddInfoAccount").css("border", "none");
      $("#confirmChangeUserAccountStatus").attr("data-status", 2);
    });

    $("#changeAddInfoAccount").click(function () {
      $(this).css("border", "1px solid red");
      $("#changeConfirmAccount").css("border", "none");
      $("#changeCancelAccount").css("border", "none");
      $("#confirmChangeUserAccountStatus").attr("data-status", 3);
    });

    $("#changeUserAccountStatus").click(function (event) {
      const statusInfo = $("#confirmChangeUserAccountStatus").attr(
        "data-status"
      );
      if (!statusInfo) alert("Vui lòng lựa chọn trạng thái");
      else {
        $("#updateUserStatusModal").modal("toggle");
        $("#confirmModal").modal();
      }
    });

    $("#confirmChangeUserAccountStatus").click(function () {
      const statusInfo = $(this).attr("data-status");
      const userId = document.location?.pathname?.replace("/admin/users/", "");

      $.ajax({
        type: "PUT",
        url: "/user/change-user-status",
        data: {
          userId,
          userStatus: statusInfo,
        },
        success: function (data) {
          if (data.success) {
            $("#confirmModal").modal("toggle");
            alert(data?.status || "Bạn đã thay đổi mật khẩu thành công");
            const findStatus = USERSTATUS.find(
              (item) => item?.status === Number(statusInfo)
            );
            $(".user-status").text(`${findStatus?.text}`);
            $(".user-status").css(
              "background-color",
              `${findStatus?.backgroundColor}`
            );
            $("#openUpdateUserStatusModal").hide();
          }
        },
        error: function (res) {
          if (res.responseJSON.updateError) {
            alert(
              res.responseJSON?.updateError ||
                "Bạn đã thay đổi mật khẩu thất bại"
            );
          }
        },
      });
    });

    //reset-password
    $("#resetPasswordButton").click(function () {
      let valid = resetPassword();
      //OTP
      const OTPDisplay = $("#resetPasswordOTPParent").css("display");
      if (OTPDisplay !== "none") {
        if (!$("#resetPasswordOTP")?.val()?.trim()?.length) {
          displayValidate(
            "#validationResetPasswordOTP",
            "OTP không được bỏ trống"
          );
          valid = false;
        } else {
          removeValidate("#validationResetPasswordOTP");
        }
      }

      if (valid) {
        $.ajax({
          type: "PUT",
          url: "/user/forgot-password",
          data: {
            email: $("#resetPasswordEmail").val(),
            phone: $("#resetPasswordPhone").val(),
            OTP:
              OTPDisplay !== "none"
                ? $("#resetPasswordOTP")?.val()?.trim()
                : null,
          },
          success: function (data) {
            if (data.success) {
              if (data?.changePassword) {
                alert(data?.status || "Mã OTP hợp lệ, mời bạn đổi mật khẩu");
                window.location.href = "/user/change-password";
              } else {
                $("#resetPasswordOTPParent").css("display", "flex");
                $("#resetPasswordEmail").prop("disabled", true);
                $("#resetPasswordPhone").prop("disabled", true);
                if (
                  $("#otpCounter").text() === "Gửi lại mã OTP" ||
                  !$("#otpCounter").text()?.length
                ) {
                  let count = 60,
                    timer = setInterval(function () {
                      $("#otpCounter").html(`00:00:${count--}`);
                      $("#otpCounter").css("color", "red");
                      if (count == 1) {
                        clearInterval(timer);
                        $("#otpCounter").html(`Gửi lại mã OTP`);
                        $("#otpCounter").css("color", "blue");
                        $("#otpCounter").css("cursor", "pointer");
                      }
                    }, 1000);
                }
                alert(data?.status || "Vui lòng kiểm tra email để lấy mã OTP");
              }
            }
          },
          error: function (res) {
            if (res.responseJSON.forgotPasswordError) {
              alert(
                res.responseJSON?.forgotPasswordError ||
                  "Thực hiện yêu cầu thất bại"
              );
            }
          },
        });
      }
    });

    $("#otpCounter").click(function () {
      if (
        $("#otpCounter").text() === "Gửi lại mã OTP" ||
        !$("#otpCounter").text()?.length
      ) {
        let valid = resetPassword();
        if (valid) {
          $.ajax({
            type: "PUT",
            url: "/user/forgot-password",
            data: {
              email: $("#resetPasswordEmail").val(),
              phone: $("#resetPasswordPhone").val(),
              type: "resend",
            },
            success: function (data) {
              if (
                $("#otpCounter").text() === "Gửi lại mã OTP" ||
                !$("#otpCounter").text()?.length
              ) {
                let count = 60,
                  timer = setInterval(function () {
                    $("#otpCounter").html(`00:00:${count--}`);
                    $("#otpCounter").css("color", "red");
                    if (count == 1) {
                      clearInterval(timer);
                      $("#otpCounter").html(`Gửi lại mã OTP`);
                      $("#otpCounter").css("color", "blue");
                      $("#otpCounter").css("cursor", "pointer");
                    }
                  }, 1000);
              }
              alert(data?.status || "Vui lòng kiểm tra email để lấy mã OTP");
            },
            error: function (res) {
              if (res.responseJSON.forgotPasswordError) {
                alert(
                  res.responseJSON?.forgotPasswordError ||
                    "Thực hiện yêu cầu thất bại"
                );
              }
            },
          });
        }
      }
    });

    //user-update-identity
    $("#userUpdateIdentityModal").click(function (event) {
      let valid = true;
      //user front identity card
      const userFrontIdentityCard = $("#updateFrontcmnd")[0].files[0];
      if (!userFrontIdentityCard) {
        displayValidate(
          "#validationUpdateFrontcmnd",
          "Hình ảnh chứng minh mặt trước không được bỏ trống"
        );
        valid = false;
      } else {
        removeValidate("#validationUpdateFrontcmnd");
      }

      //user back identity card
      const userBackIdentityCard = $("#updateBackcmnd")[0].files[0];
      if (!userBackIdentityCard) {
        displayValidate(
          "#validationUpdateBackcmnd",
          "Hình ảnh chứng minh mặt sau không được bỏ trống"
        );
        valid = false;
      } else {
        removeValidate("#validationUpdateBackcmnd");
      }

      if (valid) {
        $("#updateIdentityModal").modal("toggle");
        $("#userUpdateIdentityConfirmModal").modal();
      }
    });

    //confirm change identity
    $("#confirmChangeUserIdentity").click(function (event) {
      const userFrontIdentityCard = $("#updateFrontcmnd")[0].files[0];
      const userBackIdentityCard = $("#updateBackcmnd")[0].files[0];

      const formData = new FormData();
      formData.append("userFrontIdentityCard", userFrontIdentityCard);
      formData.append("userBackIdentityCard", userBackIdentityCard);
      $.ajax({
        type: "PUT",
        url: "/user/change-identity",
        processData: false,
        contentType: false,
        data: formData,
        success: function (data) {
          if (data.success) {
            $(".user-status").text(`Đang chờ xác minh`);
            $(".user-status").css("background-color", `#f6fc9d`);
            $(".changeUserIdentityFrame").css("display", `none`);
            $("#userUpdateIdentityConfirmModal").modal("toggle");
          }
        },
        error: function (res) {
          if (res.responseJSON.changeIdentityError) {
            alert("Thay đổi thông tin thất bại");
            $("#updateIdentityModal").modal("");
            $("#userUpdateIdentityConfirmModal").modal("toggle");
          }
        },
      });
    });

    $("#homeTabStatusConfirming").click(function (event) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("status", 0);
      window.location.search = searchParams.toString();
    });

    $("#homeTabStatusAll").click(function (event) {
      window.location.href = "/admin/users";
    });

    $("#homeTabStatusConfirm").click(function (event) {
      var searchParams = new URLSearchParams(window.location.search);
      searchParams.set("status", 1);
      window.location.search = searchParams.toString();
    });

    $("#homeTabStatusClock").click(function (event) {
      var searchParams = new URLSearchParams(window.location.search);
      searchParams.set("status", 2);
      window.location.search = searchParams.toString();
    });

    $("#homeTabStatusUpdateInfo").click(function (event) {
      var searchParams = new URLSearchParams(window.location.search);
      searchParams.set("status", 3);
      window.location.search = searchParams.toString();
    });

    $("#homeTabStatusAlwayClock").click(function (event) {
      var searchParams = new URLSearchParams(window.location.search);
      searchParams.set("status", 4);
      window.location.search = searchParams.toString();
    });

    //unlockuser
    $("#confirmUnclockUser").click(function (event) {
      const userId = $(this).attr("data-id");

      $.ajax({
        type: "PUT",
        url: "/user/clock",
        data: {
          userId: userId,
          status: false,
        },
        success: function (data) {
          $("#unclockUserConfirmModal").modal("toggle");
          $(`#userClock_${userId}`).remove();
        },
        error: function (res) {
          if (res.responseJSON.error) {
            alert(res.responseJSON?.error || "Thực hiện yêu cầu thất bại");
          }
        },
      });
    });

    //rechange money
    $("#rechargeMoneyModalButton").click(function (event) {
      $("#validateRechargeMoney").html("");
      const cardNumber = $("#cardNumber").val();
      const expiredDate = $("#expiredDate").val();
      const cvcNumber = $("#cvcNumber").val();
      const moneyChargeMoney = $("#moneyChargeMoney").val();
      let valid = true;
      const month = (" " + expiredDate).slice(1).substring(0, 2);
      const year = (" " + expiredDate).slice(1).substring(3);

      if (!cardNumber.replaceAll(".", "").length) {
        $("#validateRechargeMoney").html("Vui lòng nhập thông tin số thẻ");
        valid = false;
      } else if (month > 12) {
        $("#validateRechargeMoney").html("Tháng không hợp lệ");
        valid = false;
      } else if (!validateExpiredData(month, year)) {
        $("#validateRechargeMoney").html(
          "Ngày hết hạn cần lớn hơn ngày hiện tại"
        );
        valid = false;
      } else if (cvcNumber?.length < 3) {
        $("#validateRechargeMoney").html("Số cvc cần đủ 3 kí tự");
        valid = false;
      } else if (Number(moneyChargeMoney) < 10000) {
        $("#validateRechargeMoney").html("Số tiền cần nạp cần lớn hơn 10.000đ");
        valid = false;
      }

      if (valid) {
        $.ajax({
          type: "POST",
          url: "/transaction/recharge",
          data: {
            cardNumber,
            expiredDate,
            cvcNumber,
            moneyChargeMoney,
          },
          success: function (data) {
            alert("Nạp tiền vào tài khoản thành công");
            $("#rechargeMoneyModal").modal("toggle");
          },
          error: function (res) {
            if (res.responseJSON.error) {
              $("#validateRechargeMoney").html(
                res.responseJSON.error ||
                  "Đã xảy ra vấn đề trong quá trình xử lí thông tin"
              );
            }
          },
        });
      }
    });

    $("#withdrawMoneyModalButton").click(function (event) {
      $("#validateWithdrawMoney").html("");
      const cardNumber = $("#withdrawCardNumber").val();
      const expiredDate = $("#withdrawExpiredDate").val();
      const cvcNumber = $("#withdrawCvcNumber").val();
      const withdrawMoneyNote = $("#noteWithdrawMoney").val();
      const withdrawMoney = $("#withdrawCardMoney").val();
      let valid = true;
      const month = (" " + expiredDate).slice(1).substring(0, 2);
      const year = (" " + expiredDate).slice(1).substring(3);

      if (!cardNumber.replaceAll(".", "").length) {
        $("#validateWithdrawMoney").html("Vui lòng nhập thông tin số thẻ");
        valid = false;
      } else if (month > 12) {
        $("#validateWithdrawMoney").html("Tháng không hợp lệ");
        valid = false;
      } else if (!validateExpiredData(month, year)) {
        $("#validateWithdrawMoney").html(
          "Ngày hết hạn cần lớn hơn ngày hiện tại"
        );
        valid = false;
      } else if (cvcNumber?.length < 3) {
        $("#validateWithdrawMoney").html("Số cvc cần đủ 3 kí tự");
        valid = false;
      } else if (
        Number(withdrawMoney) <= 0 ||
        Number(withdrawMoney) % 50000 !== 0
      ) {
        $("#validateWithdrawMoney").html(
          "Số tiền cần rút phải là bội số của 50000"
        );
        valid = false;
      } else if (withdrawMoneyNote?.length <= 0) {
        $("#validateWithdrawMoney").html(
          "Thông tin ghi chú không được bỏ trống"
        );
        valid = false;
      }

      if (valid) {
        $.ajax({
          type: "POST",
          url: "/transaction/withdraw",
          data: {
            cardNumber,
            expiredDate,
            cvcNumber,
            withdrawMoney,
            withdrawMoneyNote,
          },
          success: function (data) {
            alert("Rút tiền thành công");
            $("#withdrawMoneyModal").modal("toggle");
          },
          error: function (res) {
            if (res.responseJSON.error) {
              $("#validateWithdrawMoney").html(
                res.responseJSON.error ||
                  "Đã xảy ra vấn đề trong quá trình xử lí thông tin"
              );
            }
          },
        });
      }
    });

    $("#userDetailTabInfo").click(function (event) {
      window.location.href = "/user-detail?type=info";
    });

    $("#userTransactionTabInfo").click(function (event) {
      window.location.href = "/user-detail?type=transaction";
    });

    $("#openUpdateTransactionStatusModal").click(function (event) {
      $("#changeTransactionConfirmModal").modal("toggle");
    });

    $("#confirmChangeTransaction").click(function (event) {
      const location = window.location;
      const pathName = location?.pathname;
      const transactionId = pathName.replace("/admin/transaction/", "");
      $.ajax({
        type: "PUT",
        url: `/transaction/changeStatus/${transactionId}`,
        data: {
          status: true,
        },
        success: function (data) {
          alert("Cập nhật trạng thái thành công");
          $("#changeTransactionConfirmModal").modal("toggle");
          $(".transactionDetailStatus").html("Đã hoàn thành");
          $(".transactionDetailStatus").css("background-color", "#007BFF");
          $(".transactionDetailStatus").css("color", "white");

          $("#updateTransactionStatusIcon").css("display", "none");
        },
        error: function (res) {
          if (res.responseJSON.error) {
            $("#validateWithdrawMoney").html(
              res.responseJSON.error ||
                "Đã xảy ra vấn đề trong quá trình xử lí thông tin"
            );
          }
        },
      });
    });

    $("#searchUserTransfer").click(function (event) {
      $("#validateSearchUserTransferInput").html("");
      $("#transferCustomerInfoDetail").css("display", "none");
      const inputVal = $("#searchUserTransferInput").val();

      if (!inputVal?.length) {
        $("#validateSearchUserTransferInput").html(
          "Thông tin số điện thoại không được bỏ trống"
        );
      } else {
        $.ajax({
          type: "GET",
          url: `/user/user-phone?phone=${inputVal}`,
          success: function (data) {
            $("#transferCustomerInfoDetail").css("display", "block");
            $("#transferCustomerName").html(data?.payload?.name);
            $("#transferCustomerEmail").html(data?.payload?.email);
            $("#transferMoneyModalButton").attr(
              "data-bearer",
              data?.payload?.userId
            );
          },
          error: function (res) {
            if (res.responseJSON.error) {
              $("#validateSearchUserTransferInput").html(
                res.responseJSON.error ||
                  "Đã xảy ra vấn đề trong quá trình xử lí thông tin"
              );
            }
          },
        });
      }
    });

    $("#transferMoneyModalButton").click(function (event) {
      $("#validateTransferContent").html("");
      const moneyTransfer = $("#transferMoney").val();
      const transferContent = $("#noteTransferMoney").val();
      const transferFeeBearer = $(
        'input[name="transferFeeBearer"]:checked'
      ).val();
      const bearerId = $("#transferMoneyModalButton").attr("data-bearer");
      let valid = true;

      if (!moneyTransfer?.length) {
        $("#validateTransferContent").html(
          "Số tiền chuyển không được để trống"
        );
        valid = false;
      } else if (!transferContent?.length) {
        $("#validateTransferContent").html(
          "Nội dung chuyển khoản không được bỏ trống"
        );
        valid = false;
      } else if (!transferFeeBearer) {
        $("#validateTransferContent").html(
          "Thông tin người chịu phí chuyển khoản không được bỏ trống"
        );
        valid = false;
      }

      if (valid) {
        $.ajax({
          type: "POST",
          url: `/transaction/send-otp-transfer`,
          data: {
            moneyTransfer,
            transferContent,
            transferFeeBearer,
            bearerId,
          },
          success: function (data) {
            alert("Vui lòng nhập thông tin OTP để xác nhận chuyển tiền");
            $("#transferStep1").css("display", "none");
            $("#transferStep2").css("display", "block");
            if (
              $("#transferCountdown").text() === "Gửi lại mã OTP" ||
              !$("#transferCountdown").text()?.length
            ) {
              let count = 60,
                timer = setInterval(function () {
                  $("#transferCountdown").html(`00:00:${count--}`);
                  $("#transferCountdown").css("color", "red");
                  if (count == 1) {
                    clearInterval(timer);
                    $("#transferCountdown").html(`Gửi lại mã OTP`);
                    $("#transferCountdown").css("color", "blue");
                    $("#transferCountdown").css("cursor", "pointer");
                  }
                }, 1000);
            }
          },
          error: function (res) {
            if (res.responseJSON.error) {
              $("#validateTransferContent").html(
                res.responseJSON.error ||
                  "Đã xảy ra vấn đề trong quá trình xử lí thông tin"
              );
            }
          },
        });
      }
    });

    $("#transferCountdown").click(function () {
      if (
        $("#transferCountdown").text() === "Gửi lại mã OTP" ||
        !$("#transferCountdown").text()?.length
      ) {
        $.ajax({
          type: "GET",
          url: "/transaction/resend-otp",
          success: function (data) {
            if (
              $("#transferCountdown").text() === "Gửi lại mã OTP" ||
              !$("#transferCountdown").text()?.length
            ) {
              let count = 60,
                timer = setInterval(function () {
                  $("#transferCountdown").html(`00:00:${count--}`);
                  $("#transferCountdown").css("color", "red");
                  if (count == 1) {
                    clearInterval(timer);
                    $("#transferCountdown").html(`Gửi lại mã OTP`);
                    $("#transferCountdown").css("color", "blue");
                    $("#transferCountdown").css("cursor", "pointer");
                  }
                }, 1000);
            }
            alert(data?.status || "Vui lòng kiểm tra email để lấy mã OTP");
          },
          error: function (res) {
            if (res.responseJSON.forgotPasswordError) {
              alert(
                res.responseJSON?.forgotPasswordError ||
                  "Thực hiện yêu cầu thất bại"
              );
            }
          },
        });
      }
    });

    $("#transferMoneyConfirmButton").click(function (event) {
      $("#validateTransferOTP").html();
      const OTP = $("#transferMoneyOTP").val();
      let valid = true;

      if (!OTP?.length) {
        $("#validateTransferOTP").html("Mã OTP không được bỏ trống");
        valid = false;
      }

      if (valid) {
        $.ajax({
          type: "POST",
          url: `/transaction/confirm-otp-transfer`,
          data: {
            OTP,
          },
          success: function (data) {
            alert(data?.status || "Chuyển khoản thành công");
            $("#transferMoneyModal").modal("toggle");
            $("#transferCountdown").html("");
          },
          error: function (res) {
            if (res.responseJSON.error) {
              $("#validateTransferOTP").html(
                res.responseJSON.error ||
                  "Đã xảy ra vấn đề trong quá trình xử lí thông tin"
              );
            }
          },
        });
      }
    });

    $("#deleteTransactionIcon").click(function (event) {
      $("#deleteTransactionConfirmModal").modal("toggle");
    });

    $("#confirmDeleteTransaction").click(function (event) {
      const location = window.location;
      const pathName = location?.pathname;
      const transactionId = pathName.replace("/admin/transaction/", "");

      $.ajax({
        type: "PUT",
        url: `/transaction/unactive`,
        data: {
          transactionId,
        },
        success: function (data) {
          alert(data?.status || "Cập nhật trạng thái thành công");
          $("#deleteTransactionConfirmModal").modal("toggle");
          $(".transactionDetailStatus").html("Đã huỷ");
          $(".transactionDetailStatus").css("background-color", "red");
          $(".transactionDetailStatus").css("color", "white");

          $("#updateTransactionStatusIcon").css("display", "none");
        },
        error: function (res) {
          if (res.responseJSON.error) {
            $("#validateWithdrawMoney").html(
              res.responseJSON.error ||
                "Đã xảy ra vấn đề trong quá trình xử lí thông tin"
            );
          }
        },
      });

    });
  });
})(jQuery);

const displayValidate = (id, message) => {
  $(id)
    .addClass("error")
    .find("span")
    .empty()
    .append(`<i class="fa fa-exclamation-circle"></i> ${message}`);
  $(this).addClass("error");
};

const removeValidate = (id) => {
  $(id).addClass("error").find("span").empty();
  $(this).removeClass("error");
};

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1; // Months start at 0!
  let dd = date.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  const formatDate = dd + "/" + mm + "/" + yyyy;
  return formatDate;
};

const USERSTATUS = [
  { status: 1, text: "Đã xác minh", backgroundColor: "#4eed7b" },
  { status: 2, text: "Đã vô hiệu hoá", backgroundColor: "#f75423" },
  { status: 3, text: "Chờ cập nhật", backgroundColor: "#4df3ff" },
];

const resetPassword = () => {
  $(".validSuccess.success").empty();
  $(".validSuccess").removeClass("success");
  $(".validError.error").empty();
  $(".validError").removeClass("error");
  let valid = true;
  //user_name
  const email = $("#resetPasswordEmail").val();
  if (
    !email
      .trim()
      .match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  ) {
    displayValidate("#validationResetPasswordEmail", "Email sai định dạng");
    valid = false;
  } else {
    removeValidate("#validationResetPasswordEmail");
  }

  //phone
  const phone = $("#resetPasswordPhone").val();
  if (!phone.trim().match(/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/)) {
    displayValidate(
      "#validationResetPasswordPhone",
      "Số điện thoại sai định dạng"
    );
    valid = false;
  } else {
    removeValidate("#validationResetPasswordPhone");
  }
  return valid;
};

const changeUserStatus = (userId) => {
  $("#confirmUnclockUser").attr("data-id", userId);
  $("#unclockUserConfirmModal").modal();
};

function validateExpiredData(month, year) {
  var today, someday;
  var exMonth = month;
  var exYear = year;
  today = new Date();
  someday = new Date();
  someday.setFullYear(exYear, exMonth, 1);

  if (someday < today) {
    return false;
  }
  return true;
}

function switchUserTransactionDetail(transactionId) {
  window.location.href = `/user-detail/transaction/${transactionId}`;
}
