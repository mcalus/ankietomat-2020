const express = require('express')
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express()

// Required to read cookies
app.use(cookieParser());
passport.serializeUser(function(user, next) {
    // Serialize the user in the session
    next(null, user);
});
passport.deserializeUser(function(user, next) {
    // Use the previously serialized user
    next(null, user);
});
// Configuring express-session middleware
app.use(session({
    secret: 'The cake is a lie',
    resave: true,
    saveUninitialized: true
}));
// Initializing passport
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));


app.listen(3000, () => {
 
    if(typeof(process.argv[2]) === 'undefined' || process.argv[2] !== 'silent')
        console.log('Server started and is listening on port 3000')

    app.locals.logged = false
    app.locals.siteUrl = ""
    // app.locals({ 
    //     siteUrl: "/",
    //     logged: false
    // });
})


app.get('/', (request, respond) => {

    //respond.send('Homepage')

    respond.render('pages/index')

})

app.get('/register', (request, respond) => {

    respond.render('pages/register')

})

app.get('/login', (request, respond) => {

    app.locals.logged = true

    respond.render('pages/login')

})

app.get('/logout', (request, respond) => {

    app.locals.logged = false

    respond.render('pages/index')

})

app.get('/profile', (request, respond) => {

    respond.render('pages/profile')

})

app.get('/survey/new', (request, respond) => {

    respond.render('pages/surveyNew')

})

app.get('/survey/list', (request, respond) => {

    respond.render('pages/surveyList')

})

app.get('/survey/show', (request, respond) => {

    respond.render('pages/surveyShow')

})

app.get('/survey/done', (request, respond) => {

    respond.render('pages/surveyDone')

})

app.get('/survey/stats', (request, respond) => {

    respond.render('pages/stats')

})

require('./db.js')(app);