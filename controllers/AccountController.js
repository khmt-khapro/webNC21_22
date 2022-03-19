const Account = require('../models/Account')
const session = require('express-session')
const myGfs = require('../config/db/index')


class AccountController {
    index(req, res, next) {
        res.render('pages/login')
    }

    signIn(req, res, next) {
        Account.findOne({ username: req.body.username })
            .then((acc) => {
                console.log(req.body.username);
                console.log(acc);
                //
                if (req.body.username == '' || req.body.password == '') {
                    req.session.message = {
                        type: 'danger',
                        intro: 'Denied Access! ',
                        message: 'Please fill full information.'
                    }
                    return res.redirect('/account/login')
                }

                if (!acc) {
                    console.log('no exist this acc in db');
                    req.session.message = {
                        type: 'danger',
                        intro: 'User does not exists ',
                        message: 'Please make sure enter right username.'
                    }
                    return res.redirect('/account/login')
                }

                if (req.body.password !== acc.password) {
                    console.log('password wrong');
                    req.session.message = {
                        type: 'danger',
                        intro: 'Passwords is Incorrect! ',
                        message: 'Please make sure enter right password.'
                    }
                    return res.redirect('/account/login')
                }

                req.session.message = {
                    type: 'success',
                    intro: 'You are now login! ',
                    message: 'You have access to CRUD list users.'
                }
                req.session.isAuth = true
                res.redirect('/')

            })
            .catch((err) => console.log(err))
    }

    register(req, res, next) {
        res.render('pages/register')
    }


    signUp(req, res, next) {
        // console.log(req.files);
        // console.log(randomPassword(base, 6));
        
        Account.findOne({ email: req.body.email })
            .then((acc) => {
                // console.log(acc);
                //if exist acc then throw error
                if (acc) {
                    console.log('fail reg new acc');
                    return res.redirect('/account/register')
                }

                const { phone, email, fullname, birthday, address } = req.body

                let username = randomUsername()
                let password = randomPassword(base, 6)
                acc = new Account({
                    phone,
                    email,
                    fullname,
                    birthday,
                    address,
                    username,
                    password
                })

                acc.save()

                // res.json(acc)
                res.render('pages/firstTimeSignUp', {username, password})
                console.log('success reg new acc')
            })
            .catch((err) => console.log(err))
    }

    firstTimeSignUp(req, res, next){
        res.render('pages/firstTimeSignUp')
    }

    displayImageCMND(req, res, next) {
        // console.log(myGfs);
        // myGfs.gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        //     // Check if file
        //     if (!file || file.length === 0) {
        //       return res.status(404).json({
        //         err: 'No file exists'
        //       });
        //     }

        //     // Check if image
        //     if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        //       // Read output to browser
        //       const readstream = gfs.createReadStream(file.filename);
        //       readstream.pipe(res);
        //     } else {
        //       res.status(404).json({
        //         err: 'Not an image'
        //       });
        //     }
        //   });
    }

    logOut(req, res, next){
        req.session.destroy((err) => {
            if (err) throw err
            res.redirect('/account/login')
        })
    }
}

function randomUsername() {
    let rs = ''
    rs += Math.floor(1000000000 + Math.random() * 9000000000)
    return rs
}

const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const allLowerAlpha = [..."abcdefghijklmnopqrstuvwxyz"];
const allUniqueChars = [..."~!@#$%^&*()_+-=[]\{}|;:',./<>?"];
const allNumbers = [..."0123456789"];

const base = [...allCapsAlpha, ...allNumbers, ...allLowerAlpha, ...allUniqueChars];


function randomPassword(base, len) {
    return [...Array(len)]
        .map(i => base[Math.random() * base.length | 0])
        .join('');
}

module.exports = new AccountController