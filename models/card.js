const mongoose = require('mongoose');

const { Schema } = mongoose;

const cardSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
  link: {
    type: String,
    required: true,
  },
  owner: {
    type: Object,
    required: true,
  },
  likes: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    value: Date.now,
  },
}, {
  versionKey: false,
});

module.exports = mongoose.model('card', cardSchema);
