const express =  require('express');
const transactionController = require('../controllers/transaction');
const router = express.Router();

router.post('/recharge', transactionController.USER_RECHARGE);
router.post('/withdraw', transactionController.USER_WITHDRAW);
router.put('/changeStatus/:transactionId', transactionController.CHANGE_TRANSACTION_STATUS);
router.post('/send-otp-transfer', transactionController.SEND_OTP_TRANSFER);
router.post('/confirm-otp-transfer', transactionController.CONFIRM_OTP_TRANSFER);
router.get('/resend-otp', transactionController.RESEND_OTP);
router.put('/unactive', transactionController.UNACTIVE_TRANSACTION);
module.exports = router;
