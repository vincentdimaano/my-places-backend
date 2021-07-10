const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();

//find place by user's ID
router.get('/user/:uid', placesControllers.getPlacesByUserId);

//find place by place's ID
router.get('/:pid', placesControllers.getPlaceById);

//retrieve all places
router.get('/', (req, res, next) => {});

router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [check('title').not().isEmpty(), 
  check('description').isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
