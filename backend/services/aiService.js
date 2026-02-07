// ==========================================
// AI Service - Groq AI Photography Insights
// ==========================================

const Groq = require('groq-sdk');

let groqClient;
try {
  if (process.env.GROQ_API_KEY) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    console.log('✅ Groq AI initialized');
  } else {
    console.warn('⚠️  Groq API not configured, using fallback');
  }
} catch (error) {
  console.warn('⚠️  Groq API initialization failed, using fallback');
}

/**
 * Generate AI photography recommendations
 */
async function generatePhotographyInsights(weatherData) {
  try {
    if (groqClient && process.env.GROQ_API_KEY) {
      return await generateGroqInsights(weatherData);
    } else {
      return generateRuleBasedInsights(weatherData);
    }
  } catch (error) {
    console.error('AI generation error:', error.message);
    return generateRuleBasedInsights(weatherData);
  }
}

/**
 * AI-powered insights using Groq (Llama 3.3 70B)
 */
async function generateGroqInsights(weatherData) {
  try {
    console.log('🤖 Calling Groq AI for insights...');
    
    const prompt = `You are a professional sunrise photography expert. Generate recommendations for ${weatherData.beach} tomorrow at 6 AM.

Weather: ${weatherData.forecast.temperature}°C, ${weatherData.forecast.cloudCover}% clouds, ${weatherData.forecast.visibility}km visibility, ${weatherData.forecast.windSpeed}km/h wind, ${weatherData.forecast.weatherDescription}.

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "greeting": "One enthusiastic sentence about tomorrow's conditions",
  "insight": "Two sentences about photographic potential and what makes these conditions special",
  "goldenHour": {"start": "5:45 AM", "end": "7:00 AM", "quality": "Excellent/Good/Fair/Poor"},
  "cameraSettings": {"iso": "100-400", "shutterSpeed": "1/125-1/250", "aperture": "f/8-f/11", "whiteBalance": "5500-6000K"},
  "compositionTips": ["specific tip about this beach", "tip about these weather conditions", "creative technique suggestion"]
}`;

    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a professional sunrise photography expert. Always respond with valid JSON only, no markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Empty response from Groq');
    }

    // Clean up response (remove any markdown if present)
    const cleanText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const aiData = JSON.parse(cleanText);
    
    console.log('✅ Groq AI insights generated successfully');
    return { 
      source: 'groq',
      model: 'llama-3.3-70b',
      ...aiData 
    };

  } catch (error) {
    console.error('❌ Groq AI error:', error.message);
    throw error; // Will trigger fallback
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