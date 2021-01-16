var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var QuestionSchema = new Schema(
  {
    survey: {type: Schema.Types.ObjectId, ref: 'Survey', required: true},
    type: {type: Schema.Types.ObjectId, ref: 'Types', required: true},
    question: {type: String},
    required: {type: Boolean, default: false},
    default_answer: {type: String},
    date_of_create: {type: Date, default: Date.now},
  }
);

QuestionSchema
.virtual('default_answers')
.get(function () {
  return JSON.parse(this.default_answer);
});

module.exports = mongoose.model('Question', QuestionSchema, 'question');