const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS'){
    return next();
  }

  try {
    //not all req will have body i.e delete requests
    //encode token in headers to have a cleaner url
    //shows up as 'Authorization: Bearer TOKEN' so need to call split
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      throw new Error('Failed to authenticate.');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError('Failed to authenticate.', 401);
    return next(error);
  }
};
