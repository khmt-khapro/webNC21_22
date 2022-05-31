const express =  require('express');
const adminController = require('../controllers/admin');
const userController = require('../controllers/users');
const transactionController = require('../controllers/transaction');
const router = express.Router();

// dashboard
router.get('/', adminController.GET_DASHBOARD);
router.get('/users', userController.GET_LIST_USERS);
router.get('/users/:userId', userController.GET_USER_DETAIL);
router.get('/transaction', transactionController.GET_LIST_TRANSACTION);
router.get('/transaction/:transactionId', transactionController.GET_TRANSACTION_DETAIL);
module.exports = router;
