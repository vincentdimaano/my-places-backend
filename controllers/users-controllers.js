const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

  let hashedPassword;
  try {
    //hash the password with 12 rounds of salt
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user. Please try again.',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    imageUrl: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError('Failed to sign up. Please try again.', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email }, //data to be tokenized
      process.env.JWT_KEY, //private key
      { expiresIn: '1h' } //additional options
    );
  } catch (err) {
    return next(new HttpError('Failed to sign up. Please try again.', 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
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

  if (!existingUser) {
    return next(new HttpError('Invalid credentials', 401)); //401=auth failed
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError('Invalid credentials. Please try again.', 500));
  }

  if (!isValidPassword) {
    return next(new HttpError('Invalid credentials', 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(new HttpError('Failed to log in. Please try again.', 500));
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
