var express = require('express');
var router = express.Router();
const passport = require('passport');
var reversePopulate = require('mongoose-reverse-populate-v2')

var controller = require('./controllers/controllers');
var User = require('./models/user');
var Survey = require('./models/survey');
var Question = require('./models/question');
var Types = require('./models/types');
var Respond = require('./models/respond');

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

    Survey.find({author: request.user.id}).exec(function(err, result) {
        if (err) throw err

        reversePopulate({
            modelArray: result,
            storeWhere: "questions",
            arrayPop: true,
            mongooseModel: Question,
            idField: "survey"
        }, 
        function(err, popResults) {
            respond.render('pages/surveyList', {isLogged: request.isAuthenticated(), surveys: popResults})
        })
    })
})

router.get('/survey/questions/:surveyId', isLoggedIn, (request, respond) => {
    
    Survey.findOne({_id: request.params.surveyId}, function(err, result) {
        if (err) throw err
        
        if(result == null) {
            request.flash('flashMessage', 'Brak takiej ankiety!')
            respond.redirect('/survey/list')
        }

        Types.find({}, function(err, result2) {
            if (err) throw err

            respond.render('pages/surveyQuestions', {
                isLogged: request.isAuthenticated(), 
                errors: null, 
                survey: result, 
                types: result2, 
                question: null,
                externalJS: ['questions.js']
            })
        })
    })
})

router.get('/survey/question/:questionId', isLoggedIn, (request, respond) => {
    
    Question.findOne({_id: request.params.questionId}, function(err, result0) {
        
        result0.answers = JSON.parse(result0.default_answer)

        Survey.findOne({_id: result0.survey}, function(err, result) {
            if (err) throw err
            
            if(result == null) {
                request.flash('flashMessage', 'Brak takiej ankiety!')
                respond.redirect('/survey/list')
            }

            Types.find({}, function(err, result2) {
                if (err) throw err

                respond.render('pages/surveyQuestions', {
                    isLogged: request.isAuthenticated(), 
                    errors: null, 
                    survey: result, 
                    types: result2, 
                    question: result0,
                    externalJS: ['questions.js']
                })
            })
        })
    })
})

router.post('/survey/questions/:surveyId', isLoggedIn, async (request, respond) => {

    if(typeof request.body.id != 'undefined') {
        var question = await Question.findOne({_id: request.body.id})
    }
    else {
        var question = new Question()
    }

    question.survey = request.params.surveyId
    question.type = request.body.type
    question.question = request.body.question
    question.required = request.body.required
    question.default_answer = JSON.stringify(request.body.questionContent)
    
    question.save(function (err) {
        if (err) throw err

        request.flash('flashMessage', 'Pytanie zapisane')
        respond.redirect('/survey/questions/' + request.params.surveyId)
    })
})

router.get('/survey/stats', isLoggedIn, (request, respond) => {

    respond.redirect('/survey/list')
    return true

    Survey.find({author: request.user.id}, function(err, result) {
        if (err) throw err

        reversePopulate({
            modelArray: result,
            storeWhere: "questions",
            arrayPop: true,
            mongooseModel: Question,
            idField: "survey"
        }, 
        function(err, popResults) {
            reversePopulate({
                modelArray: popResults,
                storeWhere: "questions",
                arrayPop: true,
                mongooseModel: Question,
                idField: "survey"
            }, 
            function(err, popResults2) {
                respond.render('pages/surveyList', {isLogged: request.isAuthenticated(), surveys: popResults})
            })
        })

        Question.find({survey: result.id}, function(err, result2) {
            Respond.find({}, function(err, result3) {
                if (err) throw err
    
                respond.render('pages/stats', {isLogged: request.isAuthenticated(), errors: null, survey: result, types: result2, question: result0})
            })
        })
    })

})

router.get('/survey/show/:surveyId', isLoggedIn, (request, respond) => {

    Survey.findOne({_id: request.params.surveyId}, function(err, result) {
        if (err) throw err
        
        if(result == null) {
            request.flash('flashMessage', 'Brak takiej ankiety!')
            respond.redirect('/survey/list')
        }

        Question.find({survey: request.params.surveyId}, function(err, result2) {
            if (err) throw err

            respond.render('pages/surveyShow', {isLogged: request.isAuthenticated(), errors: null, survey: result, questions: result2})
        })
    })
})

router.post('/survey/show/:surveyId', isLoggedIn, (request, respond) => {

    Question.find({survey: request.params.surveyId}, function(err, result2) {
        if (err) throw err

        

        request.flash('flashMessage', 'Dziękujemy za odpowiedzenie na ankietę')
        respond.redirect('/survey/list')
    })

})


module.exports = router;



function isLoggedIn(req, res, next){
	if(req.isAuthenticated())
		return next();

	res.redirect('/login');
}

