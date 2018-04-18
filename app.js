var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/**
 * Load environment variables.
 */

require('dotenv').config();

require('./lib/connectMongoose');
require('./models/User');
require('./models/Business');
require('./models/BusinessType');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes of our application
app.use('/', require('./routes/index'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/businesses', require('./routes/api/businesses'));
app.use('/api/populate', require('./routes/api/populate'));

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('>>> In app.use');
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  if (isAPI(req)) {
    res.json({ status: 400, resultDescription: err.message, result: null });
    return;
  }

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.render('error');
});

function isAPI(req) {
  return req.path.indexOf('/api') === 0;
};

module.exports = app;
