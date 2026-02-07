# 🌅 Seaside Beacon

**AI-Powered Sunrise Prediction for Chennai Beaches**

Built by Kevin T (24BCS1045) - VIT Chennai

---

## 🎯 Features

✅ Tomorrow's 6 AM sunrise visibility predictions  
✅ Real-time AccuWeather data integration  
✅ AI-powered photography recommendations (Google Gemini)  
✅ Email subscriptions with daily 4 AM forecasts  
✅ 6 PM IST cutoff for 12-hour forecast accuracy  
✅ Professional camera settings & composition tips  
✅ Beautiful Apple-inspired UI  
✅ Fully responsive design  

---

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Weather API:** AccuWeather (Free Tier)
- **AI:** Google Gemini API
- **Email:** Gmail SMTP (Nodemailer)
- **Automation:** node-cron (Daily 4 AM emails)
- **Security:** Helmet, CORS, Rate Limiting

### Frontend
- **HTML5, CSS3, Vanilla JavaScript**
- **No frameworks** - Pure web technologies
- **Responsive design**
- **Apple-inspired aesthetics**

### Deployment
- **Backend:** Railway.app
- **Frontend:** Vercel
- **Database:** MongoDB Atlas (M0 Free Tier)
- **Cost:** $0/month

---

## 📦 Installation

### Prerequisites
```bash
Node.js 18+ installed
MongoDB Atlas account
AccuWeather API key
Google Gemini API key
Gmail account with App Password
```

### Backend Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/seaside-beacon.git
cd seaside-beacon/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Environment Variables

### Run Locally

```bash
# Backend
cd backend
npm start

# Frontend (separate terminal)
cd frontend
python3 -m http.server 8000
# OR
npx serve
```

Visit: http://localhost:8000

---

## 🚀 Deployment

### Deploy Backend to Railway

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Select repository
5. **Settings:**
   - Root Directory: `backend`
   - Start Command: `npm start`
6. **Add Variables:**
   - Copy all from .env
   - Set `NODE_ENV=production`
   - Set `FRONTEND_URL=https://your-vercel-url.vercel.app`
7. Deploy!

### Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Import from GitHub
3. **Settings:**
   - Framework: Other
   - Root Directory: `frontend`
   - Output Directory: `.`
4. Deploy!

### Update CORS

After deploying frontend:
1. Go to Railway → Variables
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy

---

## 📡 API Endpoints

### GET /api/beaches
Get list of available beaches

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "marina",
      "name": "Marina Beach",
      "coordinates": { "lat": 13.0499, "lon": 80.2824 }
    }
  ]
}
```

### GET /api/predict/:beach
Get sunrise prediction for specific beach

**Parameters:**
- `beach`: marina | elliot | covelong | mahabalipuram

**Response (after 6 PM):**
```json
{
  "success": true,
  "data": {
    "weather": {
      "available": true,
      "beach": "Marina Beach",
      "forecast": { ... },
      "prediction": {
        "score": 85,
        "verdict": "EXCELLENT"
      }
    },
    "photography": {
      "greeting": "...",
      "insight": "...",
      "cameraSettings": { ... },
      "goldenHour": { ... },
      "compositionTips": [ ... ]
    }
  }
}
```

**Response (before 6 PM):**
```json
{
  "success": true,
  "data": {
    "weather": {
      "available": false,
      "timeUntilAvailable": {
        "hours": 3,
        "minutes": 24
      },
      "message": "Predictions available after 6 PM IST"
    }
  }
}
```

### POST /api/subscribe
Subscribe to daily emails

**Body:**
```json
{
  "email": "user@example.com",
  "preferredBeach": "marina"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed! Check your email."
}
```

---

## 🎨 Features Explained

### 6 PM Cutoff Logic
AccuWeather's 12-hour forecast ensures tomorrow's 6 AM is included only after 6 PM today. Before 6 PM, users see an educational modal explaining forecast windows.

### AI Photography Mode
Google Gemini generates contextual recommendations based on actual weather:
- Camera settings (ISO, shutter, aperture, white balance)
- Golden hour timing
- Composition tips tailored to conditions

### Daily Email Automation
Cron job runs at 4:00 AM IST daily:
1. Fetches predictions for all subscribers
2. Generates AI photography insights
3. Sends beautifully formatted HTML emails
4. Updates last email timestamp

---

## 📊 Performance

- **API Response Time:** ~500ms
- **Page Load:** <2s
- **AccuWeather Calls:** ~44/day (within 50/day limit)
- **Email Delivery:** <5s per email
- **Uptime:** 99.9% (Railway)

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check MongoDB connection
# Verify all environment variables set
# Check Railway logs
```

### Predictions not working
```bash
# Test API directly:
curl https://your-backend.railway.app/api/beaches

# Check AccuWeather API key is valid
# Ensure after 6 PM IST for testing
```

### Emails not sending
```bash
# Verify Gmail App Password (not regular password)
# Check GMAIL_USER and GMAIL_APP_PASSWORD
# Test SMTP connection
```

---

## 📝 License

MIT License - Kevin T (24BCS1045)

---

## 🙏 Credits

- **Weather Data:** AccuWeather API
- **AI Insights:** Google Gemini
- **Email Service:** Gmail SMTP
- **Hosting:** Railway.app + Vercel
- **Database:** MongoDB Atlas

---

## 📧 Contact

Kevin T - 24BCS1045  
VIT Chennai  
Email: seasidebeacon@gmail.com

---

**Built with ☀️ for Chennai beach lovers and photographers**
