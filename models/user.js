var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    username: {type: String, required: true, maxlength: 100},
    password: {type: String, required: true, maxlength: 100},
    email: {type: String},
    first_name: {type: String, required: true, maxlength: 100},
    family_name: {type: String, required: true, maxlength: 100},
    date_of_join: {type: Date, default: Date.now}, 
  }
);

// Virtual for author's full name
UserSchema
.virtual('name')
.get(function () {
  return this.first_name + ' ' + this.family_name;
});

//Export model
module.exports = mongoose.model('User', UserSchema);