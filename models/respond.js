var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RespondSchema = new Schema(
  {
    survey: {type: Schema.Types.ObjectId, ref: 'Survey', required: true},
    question: {type: Schema.Types.ObjectId, ref: 'Question', required: true},
    answer: {type: String, required: true},
    responder: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    date_of_create: {type: Date, default: Date.now},
  }
);

module.exports = mongoose.model('Respond', RespondSchema, 'respond');