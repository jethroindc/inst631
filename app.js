var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var _ = require('underscore');
var accounting = require('accounting');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// enable sessions
app.use(session({
    secret: "don't tell anyone -- it's a secret",
    resave: false,
    saveUninitialized: false
}));

// setup our static paths
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

// all of our routes that map paths to templates
mapRoute('/', 'index', 'Welcome');
mapRoute('/account', 'account', 'Edit Your Account');
mapRoute('/login', 'login', 'Login');

// track
mapRoute('/track', 'track/home', 'Tracking');
mapRoute('/track/joec', 'track/joec', 'Tracking - Joe C.');
mapRoute('/track/joec/receive', 'track/receive', 'Tracking - Receive Payment');
mapRoute('/track/joec/receive/cash', 'track/cash', 'Tracking - Receive Cash');
mapRoute('/track/received', 'track/received', 'Tracking - Payment Received');
mapRoute('/track/marie', 'track/marie', 'Tracking - Marie');
mapRoute('/track/marie/payment', 'track/marie_make_payment', 'Tracking - Marie');
mapRoute('/track/jorge', 'track/jorge', 'Tracking - Borrowing request from Jorge');
mapRoute('/track/brahm', 'track/brahm', 'Tracking - Waiting for response from Brahm');

// lend
mapRoute('/lend', 'lend/start', 'New Loan Plan');
mapRoute('/lend/groups', 'lend/groups', 'Select group that contains the person to lend to');
mapRoute('/lend/groups/select', 'lend/groups_select', 'Select Person to Lend To');
mapRoute('/lend/new_contact', 'lend/new_contact', 'Please enter the new contact information');
mapRoute('/lend/amount', 'lend/amount', 'Amount to Lend', ['amount']);
mapPost('/lend/amount', 'lend/amount', 'Amount to Lend', ['to']);
mapPost('/lend/methods', 'lend/methods', 'Methods for Repayment', ['amount']);
mapRoute('/lend/methods', 'lend/methods', 'Methods for Repayment', ['method']);
mapPost('/lend/installments', 'lend/installments', 'Able to Repay in Installments?', ['method']);
mapRoute('/lend/installments', 'lend/installments', 'Able to Repay in Installments?');
mapRoute('/lend/installments/schedule', 'lend/installments_schedule', 'Select Installment Schedule', ['amount']);
mapPost('/lend/reminders', 'lend/reminders', 'Send Automated Reminders?', ['schedule_details']);
mapRoute('/lend/reminders', 'lend/reminders', 'Send Automated Reminders?');
mapRoute('/lend/reminders/info', 'lend/reminders_info', 'How should we send reminders?');
mapPost('/lend/reminders/info', 'lend/reminders_info', 'How should we send reminders?', ['remind']);
mapRoute('/lend/review', 'lend/lets_review', 'Let\'s Review', ['amount', 'to', 'method', 'schedule_details']);
mapPost('/lend/review', 'lend/lets_review', 'Let\'s Review', ['remind'], ['amount', 'to', 'method', 'remind', 'schedule_details']);
mapRoute('/lend/final', 'lend/final', 'Final Review', ['amount', 'to', 'method' ]);
mapRoute('/lend/sent', 'lend/sent', 'Your Plan Has Been Sent', ['to']);

// borrow
mapRoute('/borrow', 'borrow/home', 'Request to borrow money (step 1 of 5)', ['amount']);
mapPost('/borrow/from', 'borrow/from', 'Request to borrow money (step 2 of 5)', ['amount']);
mapRoute('/borrow/new_contact', 'borrow/new_contact', 'Please enter the new contact information');
mapRoute('/borrow/from', 'borrow/from', 'Request to borrow money (step 2 of 5)');
mapRoute('/borrow/from/select', 'borrow/from_select', 'Request to borrow money (step 3 of 5)');
mapPost('/borrow/repay', 'borrow/repay', 'Request to borrow money (step 4 of 5)', ['from']);
mapRoute('/borrow/repay', 'borrow/repay', 'Request to borrow money (step 4 of 5)', ['date']);
mapPost('/borrow/review', 'borrow/review', 'Review your request to borrow money (step 5 of 5)', ['date'], ['amount', 'from', 'date']);
mapRoute('/borrow/sent', 'borrow/sent', 'Your Request Has Been Sent', ['from']);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    "use strict";
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    "use strict";
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



// handle a post request
//     path            - path to handle
//     template        - name of jade template to use
//     title           - title of the page
//     params          - parameters to save to the session from the post request
//     template_params - parameters to pull from the session to pass to the template
function mapPost(path, template, _title, params, template_params) {
    "use strict";
    app.post(path, function (req, res, next) {
        // copy any params defined in params to the 
        _.each(params, function (param) {
            if (!_.isUndefined(req.body[param]))
                console.log('setting: ', param, ', value: ', req.body[param]);
            req.session[param] = req.body[param];
        });

        var final_params = createTemplateParams(_title, req.session, template_params)
        res.render(template, final_params);
    });
}

// create a dictionary of template parameters pulled from the session
//    title          - title to pass to the page
//    session        - session from the request
//    session_params - which parmeters to pull from the session
function createTemplateParams(_title, session, session_params) {
    var final_params = {
        title: _title
    };

    // copy any template params to a dictionary
    // that we can use to pass to the jade template
    if (!_.isUndefined(session_params)) {
        _.each(session_params, function (param) {
            var value = session[param];
            if (param === 'amount') {
                final_params[ 'dollar_amount' ] = accounting.formatMoney(value);
            }
            console.log('adding ', param, ' to the template parameters, value: ', value);
            final_params[param] = value;
        });
    }
    return final_params;
}


// handle a get request
//     path - path segnment to handle
//     template - jade template to use
//     title - title to use for the page
//     template_params - list of paraemters to pull from the session and pass to the template
function mapRoute(path, template, _title, template_params) {
    "use strict";
    app.get(path, function (req, res, next) {
        var final_params = createTemplateParams(_title, req.session, template_params);
        res.render(template, final_params);
    });
}


module.exports = app;