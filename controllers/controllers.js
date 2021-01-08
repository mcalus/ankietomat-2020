const { body,validationResult } = require('express-validator');

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
    body('password').trim().isLength({ min: 1 }).escape().withMessage('Proszę podać hasło')
        .isAlphanumeric().withMessage('Hasło nie zawiera znaków alfanumerycznych'),

    // Process request after validation and sanitization.
    (request, respond, next) => {
        
        // Extract the validation errors from a request.
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

                request.flash('flashMessage', 'Użytkownik stworzony')
                respond.render('pages/register', {isLogged: request.isAuthenticated()})
            })
        }
    }

]