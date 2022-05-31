const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieSession = require('cookie-session');
const path = require('path');
const app = express();
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const homeRouter = require('./routes/index');
const transactionRouter = require('./routes/transaction');

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_KEY || 'DOAN'],
  maxAge: 4 * 7 * 24 * 60 * 60 * 1000
}));


require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './public')));

app.use('/', homeRouter);
app.use('/user', usersRouter);
app.use('/admin', adminRouter);
app.use('/transaction', transactionRouter);
app.get('/404', (req,res) => {res.render('404')})
app.get('*',(req, res) => {res.status(404).redirect('/404')})

const port = process.env.PORT || 3000;
console.log(`Server is listening on port ${port}`);
app.listen(port);