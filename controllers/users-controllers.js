const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Egg Man',
    email: 'test@test.com',
    password: 'test1234',
  },
  {
    id: 'u2',
    name: 'John Doe',
    email: 'test1@test.com',
    password: 'test5678',
  },
];

//retrieve list of all users
const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USERS });
};

const signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid credentials, please try again.', 422);
  }

  const { name, email, password } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    throw new HttpError('User already exists.', 422); //422=invalid user
  }

  const createdUser = {
    id: uuid(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const logIn = (req, res, next) => {
  const { email, password } = req.body;

  const foundUser = DUMMY_USERS.find((u) => u.email === email);
  if (!foundUser || foundUser.password !== password) {
    throw new HttpError('Invalid credentials', 401); //401=auth failed
  }

  res.json({ message: 'Logged In' });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.logIn = logIn;
