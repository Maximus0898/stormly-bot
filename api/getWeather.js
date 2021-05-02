const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const apiKey = process.env.OWM_KEY;

const getWeather = async (city) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  const res = await axios.get(url);

  return res.data;
};

module.exports = getWeather;
