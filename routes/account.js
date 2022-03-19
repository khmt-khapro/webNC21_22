const express = require('express')
const router = express.Router()
const upload = require('../config/db/multerGridFsStorage')

const AccountController = require('../controllers/AccountController')

router.get('/login', AccountController.index)
router.post('/login', AccountController.signIn)
router.get('/firstTimeSignUp', AccountController.firstTimeSignUp)
router.get('/register', AccountController.register)
router.post('/register', 
    upload.fields([
        {name: 'imageIDfront', maxCount: 1}, {name: 'imageIDback', maxCount: 1}
    ]),
    // upload.single('imageIDfront'),
    AccountController.signUp)
//api get imageCMND
router.get('/image/:filename', AccountController.displayImageCMND)
router.post('/logout', AccountController.logOut)


module.exports = router