const express = require('express')
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express()

// Required to read cookies
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }))

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
    
    app.locals.config = require('./config.json')
    app.locals.logged = false
    app.locals.siteUrl = app.locals.config.site.url
    // app.locals({ 
    //     siteUrl: "/",
    //     logged: false
    // });
})

var router = require('./routes.js');
app.use('/', router);



require('./controllers/db.js')(app);