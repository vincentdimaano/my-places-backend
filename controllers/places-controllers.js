const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Transamerica Pyramid',
    description: 'Iconic futurist building in the San Francisco skyline.',
    imageUrl:
      'https://www.maxpixel.net/static/photo/1x/Skyline-Transamerica-Pyramid-City-Cityscape-1633204.jpg',
    address: '600 Montgomery St, San Francisco, CA 94111',
    location: {
      lat: 37.7951775,
      lng: -122.4027787,
    },
    creator: 'u1',
  },
  {
    id: 'p2',
    title: 'Transamerica Pyramid',
    description: 'Iconic futurist building in the San Francisco skyline.',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/57/Transamerica_Pyramid_Columbus_Ave.jpg',
    address: '600 Montgomery St, San Francisco, CA 94111',
    location: {
      lat: 37.7951775,
      lng: -122.4027787,
    },
    creator: 'u2',
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    return next(new HttpError('No place was found for that ID.', 404));
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);

  if (!places || places.length === 0) {
    return next(new HttpError('No place was found for that user.', 404)); //if synch: can use throw(error) <-no need to return
  }
  res.json({ places });
};

const createPlace = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw HttpError('Invalid inputs submitted. Please try again.', 422);
  }

  const { title, description, coordinates, address, creator } = req.body;

  const newPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(newPlace);

  res.status(201).json({ newPlace }); //status 201 = resource created
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs submitted. Please try again.', 422);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid
  if (!DUMMY_PLACES.find(p=>p.id===placeId)){
    throw new HttpError('Could not find the place to be deleted.',404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);

  res.status(200).json({ message: 'Place deleted.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
