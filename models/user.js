const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    require: true,
    minLength: 2,
    maxLength: 30,
  },
  about: {
    type: String,
    require: true,
    minLength: 2,
    maxLength: 30,
  },
  avatar: {
    type: String,
    require: true,
  },
}, {
  versionKey: false,
});

module.exports = mongoose.model('user', userSchema);
