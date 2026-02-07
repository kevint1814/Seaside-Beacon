// ==========================================
// Email Service - Gmail Integration
// ==========================================

const nodemailer = require('nodemailer');

function createTransporter() {
  // Use Brevo (Sendinblue) for reliable SMTP
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER || process.env.GMAIL_USER, // Your Brevo login email
      pass: process.env.BREVO_API_KEY || process.env.GMAIL_APP_PASSWORD // Brevo SMTP key
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(subscriberEmail, beachName) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Seaside Beacon',
        address: process.env.GMAIL_USER
      },
      to: subscriberEmail,
      subject: '🌅 Welcome to Seaside Beacon',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: #D64828; color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; color: #0F0F0F; }
    .content h2 { font-size: 22px; margin-bottom: 16px; }
    .content p { line-height: 1.6; color: #404040; margin-bottom: 16px; }
    .feature { background: #FAFAFA; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .feature-item { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .feature-icon { font-size: 20px; margin-right: 12px; }
    .footer { background: #FAFAFA; padding: 30px; text-align: center; font-size: 14px; color: #737373; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌅 Welcome to Seaside Beacon</h1>
    </div>
    <div class="content">
      <h2>Never Miss Another Perfect Sunrise</h2>
      <p>Thank you for subscribing! You've unlocked daily AI-powered sunrise predictions for <strong>${beachName}</strong>.</p>
      <p>Every morning at 4:00 AM IST, we'll send you tomorrow's sunrise forecast so you can plan your perfect beach morning.</p>
      <div class="feature">
        <div class="feature-item">
          <span class="feature-icon">🤖</span>
          <div><strong>AI-Powered Predictions</strong><br>Smart visibility analysis based on real weather data</div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📸</span>
          <div><strong>Photography Insights</strong><br>Camera settings and composition tips tailored to conditions</div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🌤️</span>
          <div><strong>Tomorrow's 6 AM Forecast</strong><br>Precise weather data for sunrise time</div>
        </div>
      </div>
      <p><strong>Your first prediction arrives tomorrow morning at 4:00 AM!</strong></p>
    </div>
    <div class="footer">
      <p><strong>Seaside Beacon</strong> - Your intelligent sunrise companion</p>
      <p>Made with ☀️ in Chennai</p>
    </div>
  </div>
</body>
</html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${subscriberEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    throw error;
  }
}

/**
 * Send daily prediction email
 */
async function sendDailyPredictionEmail(subscriberEmail, weatherData, photographyInsights) {
  try {
    const transporter = createTransporter();
    const { beach, forecast, prediction } = weatherData;
    const statusColor = prediction.score >= 65 ? '#059669' : prediction.score >= 50 ? '#D97706' : '#DC2626';

    const mailOptions = {
      from: {
        name: 'Seaside Beacon',
        address: process.env.GMAIL_USER
      },
      to: subscriberEmail,
      subject: `🌅 Tomorrow's Sunrise: ${prediction.verdict} at ${beach}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
    .content { padding: 30px; }
    .prediction-card { background: linear-gradient(135deg, #FAFAFA, #F5F5F5); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center; }
    .score { font-size: 56px; font-weight: 700; color: ${statusColor}; margin: 0; }
    .verdict { font-size: 20px; font-weight: 600; margin: 8px 0; }
    .weather-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .weather-item { background: #FAFAFA; border-radius: 8px; padding: 16px; text-align: center; }
    .weather-label { font-size: 13px; color: #737373; }
    .weather-value { font-size: 20px; font-weight: 600; color: #0F0F0F; }
    .insight-box { background: #FFF4ED; border-left: 4px solid #D64828; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .camera-settings { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; }
    .setting-item { background: #0F0F0F; color: white; border-radius: 8px; padding: 12px; text-align: center; }
    .setting-label { font-size: 11px; text-transform: uppercase; opacity: 0.7; }
    .setting-value { font-size: 18px; font-weight: 600; margin-top: 4px; }
    .tips-list { list-style: none; padding: 0; }
    .tips-list li { padding: 12px; background: #FAFAFA; border-radius: 6px; margin-bottom: 8px; }
    .tips-list li:before { content: "📸"; margin-right: 8px; }
    .footer { background: #FAFAFA; padding: 24px; text-align: center; font-size: 13px; color: #737373; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${prediction.verdict}</h1>
      <p>Tomorrow's Sunrise at ${beach}</p>
    </div>
    <div class="content">
      <div class="prediction-card">
        <p class="score">${prediction.score}</p>
        <p class="verdict">Visibility Score</p>
        <p style="color: #737373; margin: 8px 0 0 0;">Tomorrow at 6:00 AM IST</p>
      </div>
      <h2 style="font-size: 20px; margin-bottom: 16px;">Weather Conditions</h2>
      <div class="weather-grid">
        <div class="weather-item"><div class="weather-label">Temperature</div><div class="weather-value">${forecast.temperature}°C</div></div>
        <div class="weather-item"><div class="weather-label">Cloud Cover</div><div class="weather-value">${forecast.cloudCover}%</div></div>
        <div class="weather-item"><div class="weather-label">Humidity</div><div class="weather-value">${forecast.humidity}%</div></div>
        <div class="weather-item"><div class="weather-label">Wind Speed</div><div class="weather-value">${forecast.windSpeed} km/h</div></div>
      </div>
      <div class="insight-box">
        <h3 style="color: #D64828; margin: 0 0 12px 0;">🤖 AI Photography Insight</h3>
        <p style="margin: 0;">${photographyInsights.insight}</p>
      </div>
      <h3 style="font-size: 18px; margin: 24px 0 12px 0;">📸 Recommended Camera Settings</h3>
      <div class="camera-settings">
        <div class="setting-item"><div class="setting-label">ISO</div><div class="setting-value">${photographyInsights.cameraSettings.iso}</div></div>
        <div class="setting-item"><div class="setting-label">Shutter</div><div class="setting-value">${photographyInsights.cameraSettings.shutterSpeed}</div></div>
        <div class="setting-item"><div class="setting-label">Aperture</div><div class="setting-value">${photographyInsights.cameraSettings.aperture}</div></div>
        <div class="setting-item"><div class="setting-label">White Balance</div><div class="setting-value">${photographyInsights.cameraSettings.whiteBalance}</div></div>
      </div>
      <h3 style="font-size: 18px; margin: 24px 0 12px 0;">💡 Composition Tips</h3>
      <ul class="tips-list">
        ${photographyInsights.compositionTips.map(tip => `<li>${tip}</li>`).join('')}
      </ul>
      <p style="margin-top: 24px; padding: 16px; background: #F5F5F5; border-radius: 8px; text-align: center;">
        <strong>Golden Hour:</strong> ${photographyInsights.goldenHour.start} - ${photographyInsights.goldenHour.end} (${photographyInsights.goldenHour.quality})
      </p>
    </div>
    <div class="footer">
      <p><strong>Seaside Beacon</strong> - Daily at 4:00 AM IST</p>
    </div>
  </div>
</body>
</html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Daily prediction sent to ${subscriberEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Daily email error:', error.message);
    throw error;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendDailyPredictionEmail
};