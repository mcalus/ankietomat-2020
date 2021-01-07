var express = require('express');
var router = express.Router();

var controller = require('./controllers/controllers');

router.get('/', (request, respond) => {

    //respond.send('Homepage')

    respond.render('pages/index')

})

router.get('/register', (request, respond) => {

    controller.register(request, respond)

})

router.get('/login', (request, respond, next) => {

    if (!request.body.username || !request.body.password) {
        return respond.status(400).json({
            message: 'Please fill out all fields'
        });
    }
    
    // passport.authenticate('local', function(err, user, info) {
    //     if (err) {
    //         console.log("ERROR : " + err);
    //         return next(err);
    //     }

    //     if(user) (
    //         console.log("User Exists!")
    //         //All the data of the user can be accessed by user.x
    //         respond.json({"success" : true});
    //         return;
    //     } else {
    //         respond.json({"success" : false});
    //         console.log("Error" + errorResponse());
    //         return;
    //     }
    // })(request, respond, next);

    respond.render('pages/login')

})

router.get('/logout', (request, respond) => {

    app.locals.logged = false

    respond.render('pages/index')

})

router.get('/profile', (request, respond) => {

    respond.render('pages/profile')

})

router.get('/survey/new', (request, respond) => {

    respond.render('pages/surveyNew')

})

router.get('/survey/list', (request, respond) => {

    respond.render('pages/surveyList')

})

router.get('/survey/show/:surveyId', (request, respond) => {

    respond.render('pages/surveyShow')

})

router.get('/survey/done', (request, respond) => {

    respond.render('pages/surveyDone')

})

router.get('/survey/stats/:surveyId', (request, respond) => {

    respond.render('pages/stats')

})


module.exports = router;
