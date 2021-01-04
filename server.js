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


app.get('/testDB', (request, respond) => {

    var url = app.locals.config.db.url
    
    mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

    // const Cat = mongoose.model('Cat', { name: String });

    // const kitty = new Cat({ name: 'Zildjian' });
    // kitty.save().then(() => console.log('meow'));
    
    respond.render('pages/testDB',  {
        message: message,
        collections: collections,
        collection: coll,
        rows: rows
    })

    return true;

    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("Database connected!");
        var message = '';
        var collections = '';
        var rows = '';
        var coll = 'customers3';

        var dbo = db.db(mydb);
        var rowInsert = { name: "Company Inc", address: "Highway 37" };

        if(!dbo.collection(coll)) {
            dbo.createCollection(coll, function(err, res) {
                if (err) throw err;
                console.log("Collection created!");
                globalThis.message += "Collection created! <br/>";
            });
        }

        // dbo.collection(coll).insertOne(rowInsert, function(err, res) {
        //     if (err) throw err;
        //     console.log("1 document inserted");
        //     message += "1 document inserted: "+rowInsert+"<br />";
        // });

        dbo.collection(coll).findOne({}, function(err, result) {
            if (err) throw err;
            if(result) {
                console.log(result.name);
                message += "Row: "+result.name;
            }
        });

        dbo.listCollections().toArray(function(err, collInfos) {
            // console.log(JSON.stringify(collInfos));
            collections = JSON.stringify(collInfos);
        });

        dbo.collection(coll).find().toArray(function(err, docs) {
            // console.log(JSON.stringify(docs));
            rows = JSON.stringify(docs);
        });
        
        db.close();

    });

    respond.render('pages/testDB',  {
        message: message,
        collections: collections,
        collection: coll,
        rows: rows
    })

})