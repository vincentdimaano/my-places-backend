const express = require('express');

const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();

//middleware declaration
app.use(express.json());

//routes
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);
app.use((req,res,next)=> {
  const error = new HttpError('That route does not exist.', 404);
  throw error;
});

app.use((error, req, res, next)=>{
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({message: error.message || 'An unknown error occured!'});
});

app.listen(5000);