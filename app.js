var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// setup our static paths
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

// all of our routes that map paths to templates
mapRoute( '/', 'index', 'Welcome' );
mapRoute( '/account', 'account', 'Edit Your Account' );
mapRoute( '/login', 'login', 'Login' );

// track
mapRoute( '/track', 'track/home', 'Tracking' );
mapRoute( '/track/joec', 'track/joec', 'Tracking - Joe C.' );
mapRoute( '/track/joec/receive', 'track/receive', 'Tracking - Receive Payment' );
mapRoute( '/track/joec/receive/cash', 'track/cash', 'Tracking - Receive Cash' );
mapRoute( '/track/received', 'track/received', 'Tracking - Payment Received' );
mapRoute( '/track/marie', 'track/marie', 'Tracking - Marie' );
mapRoute( '/track/marie/payment', 'track/marie_make_payment', 'Tracking - Marie' );

// lend
mapRoute( '/lend', 'lend/home', 'Lending' );
mapRoute( '/lend/current', 'lend/current', 'Active Agreements' );
mapRoute( '/lend/current/info', 'lend/current/info', 'PDF Agreement' );

// lend - new
mapRoute( '/lend/new', 'lend/new/start', 'New Loan Plan' );
mapRoute( '/lend/new/groups', 'lend/new/groups', 'Select Person to Lend To' );
mapRoute( '/lend/new/groups/select', 'lend/new/groups_select', 'Select Person to Lend To' );
mapRoute( '/lend/new/amount', 'lend/new/amount', 'Amount to Lend' );
mapRoute( '/lend/new/methods', 'lend/new/methods', 'Methods for Repayment' );
mapRoute( '/lend/new/installments', 'lend/new/installments', 'Able to Repay in Installments' );
mapRoute( '/lend/new/installments/schedule', 'lend/new/installments_schedule', 'Select Installment Schedule' );
mapRoute( '/lend/new/reminders', 'lend/new/reminders', 'Send Automated Reminders?' );
mapRoute( '/lend/new/reminders/info', 'lend/new/reminders_info', 'How should we send reminders?' );
mapRoute( '/lend/new/review', 'lend/new/lets_review', 'Let\'s Review' );
mapRoute( '/lend/new/final', 'lend/new/final', 'Final Review' );
mapRoute( '/lend/new/sent', 'lend/new/sent', 'Your Plan Has Been Sent' );

// borrow
mapRoute( '/borrow', 'borrow/home', 'Request to borrow money (step 1 of 5)' );
mapRoute( '/borrow/from', 'borrow/from', 'Request to borrow money (step 2 of 5)' );
mapRoute( '/borrow/from/select', 'borrow/from_select', 'Request to borrow money (step 3 of 5)' );
mapRoute( '/borrow/repay', 'borrow/repay', 'Request to borrow money (step 4 of 5)' );
mapRoute( '/borrow/review', 'borrow/review', 'Review your request to borrow money (step 5 of 5)' );

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

function mapRoute( path, template, _title ) {
    app.get(path, function(req, res, next) {
      res.render( template, { title: _title });
    });
}


module.exports = app;
