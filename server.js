const express = require('express');

const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

//=== INITIALIZATION
const app = express();
const PORT = process.env.PORT || 5000;

//=== MIDDLEWARE
app.use(express.json());

//=== ROUTES
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

//=== DATABASE
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});