var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var apiRouter = require('./routes/api/');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// セッション
const sessionDBConfig = require('./config/session.json');
const sessionStore = new MySQLStore({
  host: sessionDBConfig.host,
  user: sessionDBConfig.user,
  password: sessionDBConfig.password,
  database: sessionDBConfig.database,
  charset: sessionDBConfig.charset
});
const sess = {
  secret: 'SecretKey',
  cookie: {
    maxAge: 1000 * 60 * 30,
    sameSite: 'None',
  },
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}

app.use(session(sess));

let UI_App = (req, res) => {
  res.sendFile(path.join(__dirname, 'public') + '/index.html');
}

app.use('/product', UI_App);
app.use('/order', UI_App);
app.use('/cart', UI_App);

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
