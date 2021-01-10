var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SurveySchema = new Schema(
  {
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String},
    descryption: {type: String},
    date_of_create: {type: Date, default: Date.now},
  }
);

module.exports = mongoose.model('Survey', SurveySchema, 'survey');