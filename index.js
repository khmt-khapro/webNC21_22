
const express = require('express')
const app = express()
const path = require('path')
const route = require('./routes/index')
const methodOverride = require('method-override')
const session = require('express-session')
const mongoDbSession = require('connect-mongodb-session')(session)
const db = require('./config/db/index')
require("dotenv").config()

//PORT
const PORT = process.env.PORT || 8080

app.use(express.static(path.join(__dirname, 'public')))

//set view engine
app.set('view engine', 'ejs')
app.set("views","./resources/views")

//connect db
db.connect()

// config session to MongoDB
const store = new mongoDbSession({
    uri: 'mongodb://127.0.0.1:27017/ProjectCK',
    collection: 'mySessions'
})

//post parse data
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

//override header request
app.use(methodOverride('_method'))

//config session
app.use(
    session({
        secret: "key that will sign cookie",
        resave: false,
        saveUninitialized: false,
        store: store
    })
)

//flash message middleware
app.use((req, res, next) => {
    res.locals.message = req.session.message
    delete req.session.message
    next()
})

route(app)

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})