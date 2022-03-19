const express = require('express')
const router = express.Router()
const siteRouter = require('./site')
const accountRouter = require('./account')

function route (app){
    app.use('/account', accountRouter)
    app.use('/', siteRouter)
}


module.exports = route