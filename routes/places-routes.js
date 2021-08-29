const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const fileUplaod = require('../middleware/file-upload');
const checkAuth = require('../middleware/auth');

const router = express.Router();

//=== find place by user's ID
router.get('/user/:uid', placesControllers.getPlacesByUserId);

//=== find place by place's ID
router.get('/:pid', placesControllers.getPlaceById);

//middleware to check authorization for the following routes
router.use(checkAuth);

//=== retrieve all places
router.get('/', (req, res, next) => {});

//=== create new place
router.post(
  '/',
  fileUplaod.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesControllers.createPlace
);

//=== update a place
router.patch(
  '/:pid',
  [check('title').not().isEmpty(), 
  check('description').isLength({ min: 5 })],
  placesControllers.updatePlace
);

//=== delete a place
router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
