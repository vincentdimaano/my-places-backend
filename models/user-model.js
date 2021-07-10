const mongoose = require('mongoose');

require("./place-model");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true}
});

const User = mongoose.model('User', PlaceSchema);

module.exports = User;
