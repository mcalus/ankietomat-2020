var express = require('express');
var router = express.Router();
const passport = require('passport');

var controller = require('./controllers/controllers');
var User = require('./models/user');
var Survey = require('./models/survey');
var Question = require('./models/question');
var Types = require('./models/types');

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
    successRedirect : '/profile', 
    failureRedirect : '/login', 
    badRequestMessage : 'Brakuje danych!',
    successFlash: 'Zalogowano', 
    failureFlash : true 
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
})

router.get('/survey', isLoggedIn, (request, respond) => {

    respond.redirect('/survey/list')

})

router.get('/survey/new', isLoggedIn, (request, respond) => {

    respond.render('pages/surveyNew', {isLogged: request.isAuthenticated(), errors: null})

})

router.post('/survey/new', isLoggedIn, (request, respond) => {

    var survey = new Survey(
        {
            author: request.user.id,
            title: request.body.title,
            descryption: request.body.descryption,
        });
    
    survey.save(function (err) {
        if (err) throw err

        request.flash('flashMessage', 'Ankieta utworzona')
        respond.redirect('/survey/list')
    })
})

router.get('/survey/list', isLoggedIn, (request, respond) => {

    Survey.find({author: request.user.id}, function(err, result) {
        if (err) throw err

        // result.forEach(value,key => {
            
        // });

        respond.render('pages/surveyList', {isLogged: request.isAuthenticated(), surveys: result})
    })
})

router.get('/survey/questions/:surveyId', isLoggedIn, (request, respond) => {
    console.log(request.params.surveyId)
    Survey.findOne({_id: request.params.surveyId}, function(err, result) {
        if (err) throw err
        console.log(result)
        if(result == null) {
            request.flash('flashMessage', 'Brak takiej ankiety!')
            respond.redirect('/survey/list')
        }

        Types.find({}, function(err, result2) {
            if (err) throw err
            console.log(result2)
            respond.render('pages/surveyQuestions', {isLogged: request.isAuthenticated(), errors: null, survey: result, types: result2})
        })
    })
})

router.post('/survey/questions/:surveyId', isLoggedIn, (request, respond) => {

    var question = new Question(
        {
            survey: request.params.surveyId,
            type: request.body.type,
            question: request.body.question,
            required: request.body.required,
            default_answer: request.body.default_answer,
        });
    
    question.save(function (err) {
        if (err) throw err

        request.flash('flashMessage', 'Pytanie zapisane')
        respond.redirect('/survey/questions/' + request.params.surveyId)
    })

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

