const { default: axios } = require('axios');
const HttpError = require('../models/http-error');

//calls Google's geocoding API to generate coordinates
//from user provided address
const getCoords = async (address) => {
  const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GEO_KEY}`)

  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError('Could not find coordinates for the given address.', 422);
    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoords;