var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    username: {type: String, required: true, maxlength: 100},
    password: {type: String, required: true, maxlength: 100},
    email: {type: String},
    first_name: {type: String, maxlength: 100},
    family_name: {type: String, maxlength: 100},
    date_of_join: {type: Date, default: Date.now}, 
    email: {type: Boolean, default: false},
  }
);

UserSchema
.virtual('name')
.get(function () {
  if(this.first_name !== '' || this.family_name !== '')
    return this.first_name + ' ' + this.family_name;
  else
    return this.username;
});

UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema, 'users');