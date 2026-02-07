// ==========================================
// AI Service - Google Gemini Photography Insights
// ==========================================

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.warn('⚠️  Gemini API not configured, using fallback');
}

/**
 * Generate AI photography recommendations
 */
async function generatePhotographyInsights(weatherData) {
  try {
    if (genAI && process.env.GEMINI_API_KEY) {
      return await generateAIInsights(weatherData);
    } else {
      return generateRuleBasedInsights(weatherData);
    }
  } catch (error) {
    console.error('AI generation error:', error.message);
    return generateRuleBasedInsights(weatherData);
  }
}

/**
 * AI-powered insights using Gemini
 */
async function generateAIInsights(weatherData) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are a professional sunrise photography expert. Generate recommendations for ${weatherData.beach} tomorrow at 6 AM.

Weather: ${weatherData.forecast.temperature}°C, ${weatherData.forecast.cloudCover}% clouds, ${weatherData.forecast.visibility}km visibility, ${weatherData.forecast.windSpeed}km/h wind, ${weatherData.forecast.weatherDescription}.

Respond ONLY with valid JSON (no markdown):
{
  "greeting": "One enthusiastic sentence",
  "insight": "Two sentences about photographic potential",
  "goldenHour": {"start": "5:45 AM", "end": "7:00 AM", "quality": "Excellent/Good/Fair/Poor"},
  "cameraSettings": {"iso": "100-400", "shutterSpeed": "1/125-1/250", "aperture": "f/8-f/11", "whiteBalance": "5500-6000K"},
  "compositionTips": ["tip1", "tip2", "tip3"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json\n?/g, '').replace(/```/g, '').trim();
  
  try {
    const aiData = JSON.parse(text);
    return { source: 'ai', ...aiData };
  } catch {
    return generateRuleBasedInsights(weatherData);
  }
}

/**
 * Rule-based fallback insights
 */
function generateRuleBasedInsights(weatherData) {
  const { forecast, prediction, beach } = weatherData;
  
  let greeting;
  if (prediction.score >= 80) greeting = `✨ Spectacular conditions at ${beach}!`;
  else if (prediction.score >= 65) greeting = `🌅 Promising sunrise ahead at ${beach}!`;
  else if (prediction.score >= 50) greeting = `☁️ Interesting conditions at ${beach}.`;
  else greeting = `🌫️ Moody atmosphere at ${beach}.`;

  let insight;
  if (forecast.cloudCover < 30) {
    insight = 'Clear skies will produce vibrant colors with strong directional light. Perfect for silhouettes and dramatic compositions.';
  } else if (forecast.cloudCover < 60) {
    insight = 'Scattered clouds create dynamic lighting with rays breaking through. Excellent for dramatic skies and textured compositions.';
  } else {
    insight = 'Heavy cloud cover provides soft, diffused light ideal for minimalist compositions and moody atmospheres.';
  }

  const goldenHour = {
    start: '5:45 AM',
    end: '7:00 AM',
    quality: forecast.cloudCover < 30 ? 'Excellent' : forecast.cloudCover < 60 ? 'Good' : 'Fair'
  };

  const cameraSettings = {
    iso: forecast.cloudCover > 60 ? '400' : forecast.cloudCover > 30 ? '200' : '100',
    shutterSpeed: forecast.cloudCover < 30 ? '1/250' : forecast.cloudCover < 60 ? '1/125' : '1/60',
    aperture: forecast.cloudCover < 40 ? 'f/11' : forecast.cloudCover < 70 ? 'f/8' : 'f/5.6',
    whiteBalance: forecast.cloudCover < 30 ? '5500K' : '6000K'
  };

  const compositionTips = [];
  if (forecast.cloudCover < 30) {
    compositionTips.push('Use rule of thirds to balance bright sun with foreground elements');
    compositionTips.push('Silhouette subjects against colorful sky for dramatic contrast');
  } else if (forecast.cloudCover < 60) {
    compositionTips.push('Capture cloud formations as leading lines toward horizon');
    compositionTips.push('Look for gaps where sunlight creates spotlight effects');
  } else {
    compositionTips.push('Focus on minimalist compositions with simplified palettes');
    compositionTips.push('Use long exposures for smooth, ethereal water surfaces');
  }

  if (beach.includes('Marina')) {
    compositionTips.push('Include lighthouse or fishing boats as foreground interest');
  } else if (beach.includes('Elliot')) {
    compositionTips.push('Beach sculptures and clean sand make excellent foregrounds');
  } else {
    compositionTips.push('Use natural rock formations to frame your composition');
  }

  return {
    source: 'rules',
    greeting,
    insight,
    goldenHour,
    cameraSettings,
    compositionTips: compositionTips.slice(0, 3)
  };
}

module.exports = { generatePhotographyInsights };
