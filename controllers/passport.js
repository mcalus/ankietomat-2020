var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

module.exports = function(passport){
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err,user);
		});
	});

	 passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passrequestToCallback : true
    },
    function(username, password, done) {
        User.findOne({ 'username' :  username }, function(err, user) {
            if (err)
                return done(err);
            if (!user)
                return done(null, false, { message: 'Brak takiego użytkownika' });

            if (!user.validPassword(password))
                return done(null, false, { message: 'Oops! Złe hasło' });

            return done(null, user, { message: 'Zalogowano' });
        });
    }));

	
};