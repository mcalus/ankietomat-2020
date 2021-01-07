var User = require('../models/user');

exports.register = function(request, respond) {
    respond.render('pages/register')
};