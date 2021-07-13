const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

const User = require('../models/user-model');

//=== retrieve list of all users
const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, '-password'); //returns all fields except password
  } catch (err) {
    return next(
      new HttpError('Request timedout. Please try again later.', 500)
    );
  }

  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

//=== signup handler
const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid credentials, please try again.', 422));
  }

  const { name, email, password } = req.body;
  let existingUser;

  //check if email is already taken
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError('Request timedout. Please try again later.', 500)
    );
  }

  if (existingUser) {
    return next(new HttpError('User already exists.', 422));
  }

  const createdUser = new User({
    name,
    email,
    imageUrl:
      'https://www.publicdomainpictures.net/pictures/270000/velka/avatar-people-person-business-u.jpg',
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError('Failed to sign up. Please try again.', 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

//=== login handler
const logIn = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError('Request timedout. Please try again later.', 500)
    );
  }

  if (!existingUser || existingUser.password !== password) {
    return next(new HttpError('Invalid credentials', 401)); //401=auth failed
  }

  res.json({ message: 'Logged In' });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
