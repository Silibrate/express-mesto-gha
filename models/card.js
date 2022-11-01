const mongoose = require('mongoose');

const { Schema } = mongoose;

const cardSchema = new Schema({
  name: {
    type: String,
    require: true,
    minLength: 2,
    maxLength: 30,
  },
  link: {
    type: String,
    require: true,
  },
  owner: {
    type: Object,
    require: true,
  },
  likes: {
    type: Object,
    require: true,
  },
  createdAt: {
    type: Date,
    value: Date.now,
  },
}, {
  versionKey: false,
});

module.exports = mongoose.model('card', cardSchema);
