var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('127.0.0.1:27017/mutualwords');
var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var email   = require("emailjs");
var fs = require('fs');

var routes = require('./routes/index');
var users = require('./routes/users');

console.log("db", db);



var app = express();

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

var data = fs.readFileSync("../../emailLogin", 'utf8').toString();

console.log('Read e-mail config ');
var emailLoginInfo = JSON.parse(data);
var smtpServer  = email.server.connect({
    user:    emailLoginInfo.user, 
    password: emailLoginInfo.password, 
    host:    emailLoginInfo.host, 
    ssl:     emailLoginInfo.useSSL
});

var pathToMongoDb = 'mongodb://127.0.0.1:27017/mutualwords';//'mongodb://127.0.0.1:27017/mutualwords';
var host = 'localhost:3000';
passwordless.init(new MongoStore(pathToMongoDb));

// Set up a delivery service
passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
        smtpServer.send({
            text:    'Hello!\nAccess your account here: http://' 
                + host + '?token=' + tokenToSend + '&uid=' 
                + encodeURIComponent(uidToSend), 
            from:    emailLoginInfo.user, 
            to:      recipient,
            subject: 'Token for ' + host
        }, function(err, message) { 
            if(err) {
                console.log(err);
            }
            callback(err);
        });
    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.set('view engine', 'ejs');
app.engine('jade', require('jade').__express);
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({secret: '42'}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({ successRedirect: '/'}));

app.use('/', routes);



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

// app.set('port', process.env.PORT || 3000);

// var server = app.listen(app.get('port'), function() {
//   console.log('Express server listening on port ' + server.address().port);
// });

module.exports = app;

