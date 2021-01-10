var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TypesSchema = new Schema(
  {
    name: {type: String},
  }
);

module.exports = mongoose.model('Types', TypesSchema, 'types');