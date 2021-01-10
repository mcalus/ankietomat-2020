var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var QuestionSchema = new Schema(
  {
    survey: {type: Schema.Types.ObjectId, ref: 'Survey', required: true},
    question: {type: String},
    required: {type: Boolean, default: false},
    default_answer: {type: String},
    date_of_create: {type: Date, default: Date.now},
  }
);

module.exports = mongoose.model('Question', QuestionSchema);