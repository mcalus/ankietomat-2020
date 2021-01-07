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
  }
);

UserSchema
.virtual('name')
.get(function () {
  return this.first_name + ' ' + this.family_name;
});

UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

//Export model
module.exports = mongoose.model('User', UserSchema);