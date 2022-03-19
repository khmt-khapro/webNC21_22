const express = require('express')
const router = express.Router()

const SiteController = require('../controllers/SiteController')
const isAuth = require('../middleware/CheckIsAuth')

router.get('/', isAuth, SiteController.index )

// router.get('/create', siteController.create )
// router.post('/create', siteController.store )
// router.get('/edit/:id', siteController.edit )
// router.post('/update/:id', siteController.update )
// router.delete('/delete/:id', siteController.delete )
// router.get('/login', LoginController.index )
// router.post('/login', LoginController.signIn )
// router.get('/register', LoginController.reg )
// router.post('/register', LoginController.signUp )
// router.post('/logout', LoginController.logOut )
// router.get('/', isAuth, siteController.show )

module.exports = router