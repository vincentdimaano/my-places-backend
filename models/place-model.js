const mongoose = require('mongoose');

require("./user-model");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  imageUrl: {type: String, required: true},
  address: {type: String, required: true},
  location: {
    lat: {type: Number, required: true},
    lng: {type: Number, required: true}
  },
  creator: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
});

const Place = mongoose.model('Place', PlaceSchema);

module.exports = Place;
