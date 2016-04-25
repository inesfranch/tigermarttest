var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/products');
require('./models/Products');
require('./models/Users');

var routes = require('./routes/index.js');
var users = require('./routes/users');

var http = require('http');
var cas = require('grand_master_cas');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: "10mb"}));
app.use(bodyParser.urlencoded({limit: "10mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

cas.configure({
  casHost: 'fed.princeton.edu',
  caspath: '/cas',
  ssl: true,
  service: 'http://localhost:3000',
  redirectUrl: '/splash'
});

/*app.get('/splash', routes.splash);
app.get('/logout', cas.logout);

app.get('/login', cas.bouncer, routes.login);
app.get('/', cas.blocker, routes.index);*/

/*app.get('/splash', function(req, res){
  res.render('splash', {name: req.session.cas_user});
});
app.get('/logout', cas.logout);

app.get('/login', cas.bouncer, function(req, res){
  res.redirect('/');
});
app.get('/', cas.blocker, function(req, res){
  res.render('index', {name: req.session.cas_user});
});*/


/*module.exports.index = function(req, res){
  res.render('index', {name: req.session.cas_user});
};

module.exports.splash = function(req, res){
  res.render('splash', {name: req.session.cas_user});
};

module.exports.login = function(req, res){
  res.redirect('/');
};*/


/*http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});*/

/*
var cas = require('grand_master_cas');

cas.configure({
  casHost: "fed.princeton.edu",   // required
  casPath: "/cas",                  // your cas login route (defaults to "/cas")
  ssl: true,                        // is the cas url https? defaults to false
  port: 443,                        // defaults to 80 if ssl false, 443 if ssl true
  service: "http://localhost:3000", // your site
  sessionName: "cas_user",          // the cas user_name will be at req.session.cas_user (this is the default)
  renew: false,                     // true or false, false is the default
  gateway: false,                   // true or false, false is the default
  redirectUrl: '/splash'            // the route that cas.blocker will send to if not authed. Defaults to '/'
});
*/

/*
app.get('/splash', routes.splash);

 // grand_master_cas provides a logout
app.get('/logout', cas.logout);

 // cas.bouncer prompts for authentication and performs login if not logged in. If logged in it passes on.
app.get('/login', cas.bouncer, routes.login);

 // cas.blocker redirects to the redirectUrl supplied above if not logged in.
app.get('/', cas.blocker, routes.index);*/

module.exports = app;
