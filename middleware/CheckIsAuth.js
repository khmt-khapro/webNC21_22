module.exports = function IsAuth(req, res, next){
    if(req.session.isAuth){
        next()
    }
    else{
        res.redirect('/account/login')
    }
}