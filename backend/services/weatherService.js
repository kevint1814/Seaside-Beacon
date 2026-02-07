// ==========================================
// Weather Service - AccuWeather Integration
// Fetches tomorrow's 6 AM IST forecast for Chennai beaches
// ==========================================

const axios = require('axios');

const ACCUWEATHER_API_KEY = process.env.ACCUWEATHER_API_KEY;
const CHENNAI_LOCATION_KEY = '206671';

// Beach configurations
const BEACHES = {
  marina: {
    name: 'Marina Beach',
    key: 'marina',
    locationKey: CHENNAI_LOCATION_KEY,
    coordinates: { lat: 13.0499, lon: 80.2824 }
  },
  elliot: {
    name: "Elliot's Beach (Besant Nagar)",
    key: 'elliot',
    locationKey: CHENNAI_LOCATION_KEY,
    coordinates: { lat: 13.0067, lon: 80.2669 }
  },
  covelong: {
    name: 'Covelong Beach',
    key: 'covelong',
    locationKey: CHENNAI_LOCATION_KEY,
    coordinates: { lat: 12.7925, lon: 80.2514 }
  },
  mahabalipuram: {
    name: 'Mahabalipuram Beach',
    key: 'mahabalipuram',
    locationKey: CHENNAI_LOCATION_KEY,
    coordinates: { lat: 12.6269, lon: 80.1932 }
  }
};

/**
 * Check if predictions are available (after 6 PM IST)
 */
function isPredictionTimeAvailable() {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const currentHour = istTime.getHours();
  return currentHour >= 18 || currentHour < 6;
}

/**
 * Get time until predictions are available
 */
function getTimeUntilAvailable() {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const currentHour = istTime.getHours();
  
  if (currentHour >= 18 || currentHour < 6) {
    return { available: true, hoursLeft: 0, minutesLeft: 0 };
  }
  
  const hoursLeft = 18 - currentHour - 1;
  const minutesLeft = 60 - istTime.getMinutes();
  
  return { available: false, hoursLeft, minutesLeft };
}

/**
 * Get list of all beaches
 */
function getBeaches() {
  return Object.values(BEACHES).map(beach => ({
    key: beach.key,
    name: beach.name,
    coordinates: beach.coordinates
  }));
}

/**
 * Fetch 12-hour hourly forecast from AccuWeather
 */
async function fetchAccuWeatherHourly(locationKey) {
  try {
    const url = `http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${locationKey}`;
    
    const response = await axios.get(url, {
      params: {
        apikey: ACCUWEATHER_API_KEY,
        details: true,
        metric: true
      }
    });

    console.log(`✅ Fetched ${response.data.length} hours of forecast data`);
    return response.data;
  } catch (error) {
    console.error('❌ AccuWeather API Error:', error.response?.data || error.message);
    throw new Error(`AccuWeather API failed: ${error.message}`);
  }
}

/**
 * Find tomorrow's 6 AM IST forecast
 */
function findTomorrow6AM(hourlyData) {
  // Get current time in IST
  const now = new Date();
  const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  // Get tomorrow's date in IST
  const tomorrow6AM_IST = new Date(nowIST);
  tomorrow6AM_IST.setDate(tomorrow6AM_IST.getDate() + 1);
  tomorrow6AM_IST.setHours(6, 0, 0, 0);
  
  // Convert IST to UTC for AccuWeather API comparison
  // IST is UTC+5:30, so we need to subtract 5.5 hours
  const targetUTC = new Date(tomorrow6AM_IST.getTime() - (5.5 * 60 * 60 * 1000));
  
  console.log(`🎯 Target: Tomorrow 6 AM IST = ${tomorrow6AM_IST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`🎯 Target UTC: ${targetUTC.toISOString()}`);

  // Find the forecast entry closest to tomorrow's 6 AM IST
  let closestForecast = hourlyData[0];
  let smallestDiff = Math.abs(new Date(hourlyData[0].DateTime) - targetUTC);

  hourlyData.forEach(forecast => {
    const forecastTime = new Date(forecast.DateTime);
    const diff = Math.abs(forecastTime - targetUTC);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestForecast = forecast;
    }
  });

  return closestForecast;
}

/**
 * Calculate visibility score (0-100)
 */
function calculateVisibilityScore(forecast) {
  let score = 100;

  const cloudCover = forecast.CloudCover || 0;
  score -= (cloudCover * 0.4);

  const visibility = forecast.Visibility?.Value || 10;
  if (visibility < 5) score -= 20;
  else if (visibility < 8) score -= 10;

  const precipProb = forecast.PrecipitationProbability || 0;
  score -= (precipProb * 0.15);

  const uvIndex = forecast.UVIndex || 0;
  if (uvIndex < 2) score -= 10;
  else if (uvIndex >= 4) score += 5;

  const windSpeed = forecast.Wind?.Speed?.Value || 0;
  if (windSpeed > 30) score -= 5;
  else if (windSpeed > 20) score -= 2;

  if (forecast.HasPrecipitation) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get visibility verdict
 */
function getVerdict(score) {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 65) return 'GOOD';
  if (score >= 50) return 'FAIR';
  if (score >= 35) return 'POOR';
  return 'VERY POOR';
}

/**
 * Get tomorrow's 6 AM IST forecast for a beach
 */
async function getTomorrow6AMForecast(beachKey) {
  const beach = BEACHES[beachKey];
  if (!beach) {
    throw new Error(`Beach '${beachKey}' not found`);
  }

  const timeCheck = getTimeUntilAvailable();
  if (!timeCheck.available) {
    return {
      available: false,
      timeUntilAvailable: {
        hours: timeCheck.hoursLeft,
        minutes: timeCheck.minutesLeft
      },
      message: 'Predictions available after 6 PM IST',
      beach: beach.name,
      beachKey: beach.key
    };
  }

  console.log(`\n📡 Fetching AccuWeather data for ${beach.name}...`);
  
  // Log current IST time for debugging
  const currentIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  console.log(`🕐 Current IST: ${currentIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

  const hourlyData = await fetchAccuWeatherHourly(beach.locationKey);
  const forecast6AM = findTomorrow6AM(hourlyData);
  
  const forecastTime = new Date(forecast6AM.DateTime);
  const istTime = new Date(forecastTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  console.log(`✅ Found forecast for ${istTime.toLocaleString('en-IN')}`);

  const weatherData = {
    temperature: Math.round(forecast6AM.Temperature.Value),
    feelsLike: Math.round(forecast6AM.RealFeelTemperature.Value),
    cloudCover: forecast6AM.CloudCover || 0,
    humidity: forecast6AM.RelativeHumidity || 0,
    windSpeed: Math.round(forecast6AM.Wind.Speed.Value),
    windDirection: forecast6AM.Wind.Direction.Localized,
    visibility: forecast6AM.Visibility?.Value || 10,
    uvIndex: forecast6AM.UVIndex || 0,
    precipProbability: forecast6AM.PrecipitationProbability || 0,
    weatherDescription: forecast6AM.IconPhrase,
    hasPrecipitation: forecast6AM.HasPrecipitation || false
  };

  const score = calculateVisibilityScore(forecast6AM);
  const verdict = getVerdict(score);

  return {
    available: true,
    beach: beach.name,
    beachKey: beach.key,
    coordinates: beach.coordinates,
    forecast: {
      ...weatherData,
      forecastTime: istTime.toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'short'
      })
    },
    prediction: {
      score,
      verdict,
      factors: {
        cloudCover: weatherData.cloudCover <= 30 ? 'Clear' : weatherData.cloudCover <= 60 ? 'Partly Cloudy' : 'Cloudy',
        visibility: weatherData.visibility >= 8 ? 'Excellent' : weatherData.visibility >= 5 ? 'Good' : 'Poor',
        precipitation: weatherData.precipProbability <= 20 ? 'Low' : weatherData.precipProbability <= 50 ? 'Moderate' : 'High',
        wind: weatherData.windSpeed <= 20 ? 'Calm' : weatherData.windSpeed <= 35 ? 'Moderate' : 'Strong'
      }
    },
    source: 'AccuWeather'
  };
}

module.exports = {
  getTomorrow6AMForecast,
  getBeaches,
  isPredictionTimeAvailable,
  getTimeUntilAvailable
};
