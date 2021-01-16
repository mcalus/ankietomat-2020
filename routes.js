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

    respond.render('pages/surveyNew', {isLogged: request.isAuthenticated(), errors: null, survey: null})

})

router.post('/survey/new', isLoggedIn, async (request, respond) => {

    if(typeof request.body.id != 'undefined') {
        var survey = await Survey.findOne({_id: request.body.id})
    }
    else {
        var survey = new Survey()
        survey.author = request.user.id
    }

    survey.title = request.body.title
    survey.descryption = request.body.descryption
    
    survey.save(function (err) {
        if (err) throw err

        request.flash('flashMessage', 'Ankieta zapisana')
        respond.redirect('/survey/list')
    })
})

router.get('/survey/edit/:surveyId', isLoggedIn, (request, respond) => {

    Survey.findOne({_id: request.params.surveyId}, function(err, result) {
        if (err) throw err
        
        if(result == null) {
            request.flash('flashMessage', 'Brak takiej ankiety!')
            respond.redirect('/survey/list')
        }

        respond.render('pages/surveyNew', {isLogged: request.isAuthenticated(), errors: null, survey: result})
    })
})

router.get('/survey/delete/:surveyId', isLoggedIn, async (request, respond) => {

    Survey.findOne({_id: request.params.surveyId}).exec(async function(err, result) {
        if (err) return handleError(err)
        
        if(result != null && String(result.author) == String(request.user._id)) {
            
            await Respond.deleteMany({survey: result._id})
            await Question.deleteMany({survey: result._id})

            result.deleteOne({}, function (err) {
                if (err) return handleError(err)

                request.flash('flashMessage', 'Ankieta ' + result.title + ' skasowana')
                respond.redirect('/survey/list')
            })
        }
        else {
            request.flash('flashMessage', 'Brak takiej ankiety')
            respond.redirect('/survey/list')
        }
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
        // respond.redirect('/survey/questions/' + request.params.surveyId)
        respond.redirect('/survey/list')
    })
})

router.get('/survey/question/delete/:questionId', isLoggedIn, (request, respond) => {

    Question.findOne({_id: request.params.questionId}).populate('survey').exec(async function(err, result) {
        if (err) return handleError(err)
        
        if(result != null && String(result.survey.author) == String(request.user._id)) {

            await Respond.deleteMany({survey: result._id})

            result.deleteOne({}, function (err) {
                if (err) return handleError(err)

                request.flash('flashMessage', 'Pytanie ' + result.question + ' skasowane')
                respond.redirect('/survey/list')
            })
        }
        else {
            request.flash('flashMessage', 'Brak takiego pytania')
            respond.redirect('/survey/list')
        }
    })
})

router.get('/survey/stats', isLoggedIn, async (request, respond) => {

    var surveys = await Survey.find({author: request.user.id})

    for(var i=0; i<surveys.length; i++) {
        surveys[i].questions = await Question.find({survey: surveys[i]._id})

        for(var j=0; j<surveys[i].questions.length; j++) {
            surveys[i].questions[j].responses = await Respond.find({question: surveys[i].questions[j]._id})
        }

        surveys[i].responses = await Respond.find({survey: surveys[i]._id}).distinct("date_of_create")
    }

    respond.render('pages/stats', {isLogged: request.isAuthenticated(), surveys: surveys})
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

