const express =  require('express');
const usersController = require('../controllers/users');
const router = express.Router();

// Sign in
router.get('/sign-in', usersController.GET_SIGNIN);
router.post('/sign-in', usersController.SIGNIN);
router.get('/sign-up', usersController.GET_SIGNUP);
router.post('/sign-up', usersController.SIGNUP);
router.get('/change-password', usersController.GET_CHANGE_PASSWORD);
router.put('/change-password', usersController.CHANGE_PASSWORD);
router.put('/change-user-status', usersController.CHANGE_USER_STATUS);
router.get('/signout', usersController.SIGNOUT);
router.get('/forgot-password', usersController.GET_FORGOT_PASSWORD);
router.put('/forgot-password', usersController.FORGOT_PASSWORD);
router.put('/change-identity', usersController.CHANGE_USER_IDENTITY);
router.put('/clock', usersController.CHANGE_USER_CLOCK);
router.get('/user-phone', usersController.GET_USER_BY_PHONE);
module.exports = router;
