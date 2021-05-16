const express = require('express')
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const flash = require('expresss-flash-messages')
var flash = require('connect-flash')

const app = express()

require('./controllers/passport')(passport);

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
    secret: 'The cake is a lie',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.use(flash())

app.use(function(req, res, next) {
    res.locals.getMessages = _getMessages(req)
    res.locals.flash = req.session.flash
    next()
});

function _getMessages(req){
	return () => {
		if(req.session === undefined) throw Error('getMessages() requires sessions')
		const msgs = req.session.flash = req.session.flash || {}
		req.session.flash = {}
		return msgs
	}
}

app.listen(3000, () => {
 
    if(typeof(process.argv[2]) === 'undefined' || process.argv[2] !== 'silent')
        console.log('Server started and is listening on port 3000')
    
    app.locals.config = require('./config.json')
    app.locals.logged = false
    app.locals.siteUrl = app.locals.config.site.url
    
    mongoose.connect(app.locals.config.db.url, { useNewUrlParser: true , useUnifiedTopology: true});
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
})


var router = require('./routes.js');
app.use('/', router);


require('./controllers/db.js')(app);
