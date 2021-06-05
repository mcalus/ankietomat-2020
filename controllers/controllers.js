const { body,validationResult } = require('express-validator')
var mailer = require('./mailer')

var User = require('../models/user');

exports.register = function(request, respond) {
    respond.render('pages/register', {isLogged: request.isAuthenticated()})
};

exports.register_do = [

    body('username').trim().isLength({ min: 1 }).escape().withMessage('Proszę uzupełnić nazwę użytkownika')
        .isAlphanumeric().withMessage('Nazwa użytkownika nie zawiera znaków alfanumerycznych')
        .custom(value => {
            return User.findOne({'username' : value}).then(user => {
              if (user) {
                return Promise.reject('Użytkownik o takim loginie istnieje');
              }
            });
          }),
    // body('password').trim().isLength({ min: 5,  max: 8 }).escape().withMessage('Proszę podać hasło od 5 do 8 znaków')
        // .isAlphanumeric().withMessage('Hasło nie zawiera znaków alfanumerycznych')
    body('password').isStrongPassword({minSymbols: 1, minNumbers: 0, minUppercase:0, minLowercase: 1, minLength: 5, pointsPerUnique:0 , pointsPerRepeat:0}).withMessage('Hasło wymaga od 5 do 8 znaków i jeden znak specjalny'),
    body('email').trim().isEmail().escape().withMessage('Proszę podać poprawny adres e-mail'),

    (request, respond, next) => {
        
        var errors = validationResult(request)

        if (!errors.isEmpty()) {
            respond.render('pages/register', { isLogged: request.isAuthenticated(), user: request.body, errors: errors.array() });
            return;
        }
        else {
            var user = new User(
                {
                    username: request.body.username,
                    email: request.body.email,
                    first_name: request.body.first_name,
                    family_name: request.body.family_name,
                });
            user.password = user.generateHash(request.body.password)
            user.save(function (err) {
                if (err) return next(err)

                if(request.body.email != '') {
                    var body = 'Dziękujemy za rejestrację w Ankietomacie. Możesz zalogować się używając swojego loginu: '+ request.body.username
                    mailer.sendMail(request, request.body.email, 'Ankietomat - rejestracja użytkownika "'+ request.body.username +'"', body)
                }

                request.flash('flashMessage', 'Użytkownik stworzony')
                // respond.render('pages/register', {isLogged: request.isAuthenticated()})
                respond.redirect('/login')
            })
        }
    }

]