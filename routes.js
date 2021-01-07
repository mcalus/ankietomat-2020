var express = require('express');
var router = express.Router();
const passport = require('passport');

var controller = require('./controllers/controllers');

router.get('/', (request, respond) => {

    //respond.send('Homepage')

    respond.render('pages/index', {isLogged: request.isAuthenticated()})

})

router.get('/register', (request, respond) => {

    controller.register(request, respond)

})

router.post('/register', controller.register_do)

router.get('/login', (request, respond, next) => {
    
    respond.render('pages/login', {isLogged: request.isAuthenticated()})

})

router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));


router.get('/logout', (request, respond) => {

    request.logout()

    respond.redirect('/')

})

router.get('/profile', isLoggedIn, (request, respond) => {

    respond.render('pages/profile', {isLogged: request.isAuthenticated()})

})

router.get('/survey/new', isLoggedIn, (request, respond) => {

    respond.render('pages/surveyNew', {isLogged: request.isAuthenticated()})

})

router.get('/survey/list', isLoggedIn, (request, respond) => {

    respond.render('pages/surveyList', {isLogged: request.isAuthenticated()})

})

router.get('/survey/show/:surveyId', isLoggedIn, (request, respond) => {

    respond.render('pages/surveyShow', {isLogged: request.isAuthenticated()})

})

router.get('/survey/done', isLoggedIn, (request, respond) => {

    respond.render('pages/surveyDone', {isLogged: request.isAuthenticated()})

})

router.get('/survey/stats/:surveyId', isLoggedIn, (request, respond) => {

    respond.render('pages/stats', {isLogged: request.isAuthenticated()})

})


module.exports = router;



function isLoggedIn(req, res, next){
	if(req.isAuthenticated())
		return next();

	res.redirect('/login');
}

