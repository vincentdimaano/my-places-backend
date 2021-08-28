const mongoose = require('mongoose');
const fs = require('fs');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoords = require('../util/location');
const Place = require('../models/place-model');
const User = require('../models/user-model');
const mongooseUniqueValidator = require('mongoose-unique-validator');

//=== find specific place given a place ID
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    //error handling for request failure
    const error = new HttpError(
      'SSomething went wrong with your request. Please try again.',
      500
    );
    return next(error);
  }

  //error handling for place not found
  if (!place) {
    return next(new HttpError('No place was found for that ID.', 404));
  }

  //.toObject() = convert place(mongoose object) to a normal JS object
  // getters: true = also, get rid of underscore on _id
  res.json({ place: place.toObject({ getters: true }) });
}; //end of getPlaceById

//=== retrieve places associated with a given user
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    return next(
      new HttpError(
        'Something went wrong with your request. Please try again.',
        500
      )
    );
  }

  if (!places || places.length === 0) {
    return next(new HttpError('No place was found for that user.', 404)); //if synch: can use throw(error) <-no need to return
  }

  //cannot use .toObject() on arrays
  //use Array.map() to use toObject on each element
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
}; //end of getPlaceByUserId

//=== create place object; call Google geocode API to fill coordinates
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  console.log(req.body);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs submitted. Please try again.', 422)
    );
  }

  const { title, description, address, creator } = req.body;
  let coordinates;

  try {
    coordinates = await getCoords(address);
  } catch (error) {
    //stop execution of rest of the file if getting coordinates failed
    return next(error);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    imageUrl: req.file.path,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(
      new HttpError('Failed to create place, please try again.', 500)
    );
  }

  if (!user) {
    return next(new HttpError('User with given ID does not exist.', 404));
  }

  //start a session so if either .save() fails, no new place is created
  try {
    const sesh = await mongoose.startSession();
    sesh.startTransaction();

    await newPlace.save({ session: sesh });
    user.places.push(newPlace);
    await user.save({ session: sesh });

    await sesh.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError('Failed to create place. Please try again.', 500)
    );
  }

  res.status(201).json({ newPlace }); //status 201 = resource created
}; //end of createPlace

//=== update a specific place given a place ID
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs submitted. Please try again.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError(
        'Something went wrong with your request. Please try again.',
        500
      )
    );
  }

  place.title = title;
  place.description = description;

  try {
    place.save();
  } catch (error) {
    return next(
      new HttpError(
        'Something went wrong with your request. Please try again.',
        500
      )
    );
  }

  res.status(200).json({ palce: place.toObject({ getters: true }) });
}; //end of updatePlace

//=== delete a specific place given a place ID
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    return next(
      new HttpError('Something went wrong. Failed to delete place.', 500)
    );
  }

  if (!place) {
    return next(new HttpError('Could not find place with the given ID.', 404));
  }

  const imagePath = place.imageUrl;

  try {
    const sesh = await mongoose.startSession();
    sesh.startTransaction();

    await place.remove({ session: sesh });
    place.creator.places.pull(place);
    await place.creator.save({ session: sesh });

    await sesh.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError('Something went wrong. Failed to delete place.', 500)
    );
  }

  //delete uploaded photo in uploads/images
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({ message: 'Place deleted.' });
}; //end of deletePlace

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
