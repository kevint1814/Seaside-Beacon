// ==========================================
// Predict Routes
// ==========================================

const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const aiService = require('../services/aiService');

/**
 * GET /api/beaches
 */
router.get('/beaches', async (req, res) => {
  try {
    const beaches = weatherService.getBeaches();
    res.json({ success: true, data: beaches });
  } catch (error) {
    console.error('Beaches error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch beaches' });
  }
});

/**
 * GET /api/predict/:beach
 */
router.get('/predict/:beach', async (req, res) => {
  try {
    const { beach } = req.params;
    console.log(`\n📍 Prediction for: ${beach}`);

    const weatherData = await weatherService.getTomorrow6AMForecast(beach);

    if (!weatherData.available) {
      return res.json({
        success: true,
        data: { weather: weatherData, photography: null }
      });
    }

    const photographyInsights = await aiService.generatePhotographyInsights(weatherData);

    res.json({
      success: true,
      data: {
        weather: weatherData,
        photography: photographyInsights
      }
    });
  } catch (error) {
    console.error('Prediction error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating prediction'
    });
  }
});

module.exports = router;
