const express =  require('express');
const homeController = require('../controllers/index');
const router = express.Router();

// Sign in
router.get('/', homeController.GET_HOME)
router.get('/user-detail', homeController.GET_HOME_USER_DETAIL)
router.get('/user-detail/transaction/:transactionId', homeController.GET_USER_TRANSACTION_DETAIL)
module.exports = router;
