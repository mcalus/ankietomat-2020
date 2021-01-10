var express = require('express');
var router = express.Router();
const passport = require('passport');

var controller = require('./controllers/controllers');
var User = require('./models/user');

router.get('/', (request, respond) => {

    //respond.send('Homepage')

    respond.render('pages/index', {isLogged: request.isAuthenticated()})

})

router.get('/register', (request, respond) => {

    controller.register(request, respond)

})

router.post('/register', controller.register_do)

router.get('/login', (request, respond, next) => {
    
    respond.render('pages/login', {isLogged: request.isAuthenticated(), errors: request.flash('error')})

})

router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    badRequestMessage : 'Brakuje danych!',
    successFlash: 'Zalogowano', 
    failureFlash : true // allow flash messages
}));


router.get('/logout', (request, respond) => {

    request.logout()

    request.flash('flashMessage', 'Wylogowano')

    respond.redirect('/')

})

router.get('/profile', isLoggedIn, (request, respond) => {

    var flash = request.flash('success')
    if(Object.keys(flash).length !== 0)
        request.flash('flashMessage', flash)

    respond.render('pages/profile', {isLogged: request.isAuthenticated(), user: request.user})

})

router.post('/profile', isLoggedIn, (request, respond) => {

    var modifyPassword = false
    if(request.body.password) {
        modifyPassword = request.user.generateHash(request.body.password)
    }

    User.findById(request.user.id, function(err, user) {
        if (!user)
          return next(new Error('Nie można znaleźć użytkownika'));
        else {
            if(modifyPassword)
                user.password = modifyPassword
            user.email = request.body.email
            user.first_name = request.body.first_name
            user.family_name = request.body.family_name
        
            user.save(function(err) {
                if (err)
                    request.flash('flashMessage', 'Problem z modyfikacją danych')
                else
                    request.flash('flashMessage', 'Dane zmodyfikowane')

                    respond.redirect('/profile')
            });
        }
    })


    // var user = new User(
    //     {
    //         email: request.body.email,
    //         first_name: request.body.first_name,
    //         family_name: request.body.family_name,
    //     });
    // user.password = user.generateHash(request.body.password)
    // user.save(function (err) {
    //     if (err) return next(err)

    //     request.flash('flashMessage', 'Dane zmodyfikowane')
    //     respond.render('pages/profile', {isLogged: request.isAuthenticated(), user: request.user})
    // })
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

router.get('/survey/stats', isLoggedIn, (request, respond) => {

    respond.render('pages/stats', {isLogged: request.isAuthenticated()})

})


module.exports = router;



function isLoggedIn(req, res, next){
	if(req.isAuthenticated())
		return next();

	res.redirect('/login');
}

