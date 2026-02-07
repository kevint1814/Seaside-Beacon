// ==========================================
// Seaside Beacon - Frontend JavaScript
// Complete working version with AccuWeather
// ==========================================

console.log('🌅 Seaside Beacon script loading...');

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://seaside-beacon.onrender.com/api',
    USE_BACKEND: true
};

// ==========================================
// STATE
// ==========================================
let state = {
    selectedBeach: 'marina',
    selectedLat: 13.0499,
    selectedLon: 80.2824,
    weatherData: null,
    photographyInsights: null,
    isProcessing: false
};

// ==========================================
// INITIALIZE ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, initializing...');
    
    try {
        initializeBeachSelection();
        initializePredictionButton();
        initializeEmailModal();
        initializePhotographyTabs();
        checkPredictionAvailability();
        
        console.log('✅ All systems initialized successfully!');
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});

// ==========================================
// BEACH SELECTION
// ==========================================
function initializeBeachSelection() {
    const beachCards = document.querySelectorAll('.beach-card');
    console.log('Found', beachCards.length, 'beach cards');
    
    beachCards.forEach(card => {
        card.addEventListener('click', function() {
            console.log('🏖️ Beach selected:', this.dataset.beach);
            
            // Remove active from all
            beachCards.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            
            // Update state
            state.selectedBeach = this.dataset.beach;
            state.selectedLat = parseFloat(this.dataset.lat);
            state.selectedLon = parseFloat(this.dataset.lon);
            
            // Hide results
            const resultsSection = document.getElementById('resultsSection');
            if (resultsSection) {
                resultsSection.style.display = 'none';
            }
        });
    });
}

// ==========================================
// PREDICTION BUTTON
// ==========================================
function initializePredictionButton() {
    const predictBtn = document.getElementById('predictBtn');
    
    if (!predictBtn) {
        console.error('❌ Predict button not found!');
        return;
    }
    
    console.log('✅ Predict button initialized');
    
    predictBtn.addEventListener('click', async function() {
        console.log('🔮 Prediction clicked for:', state.selectedBeach);
        await handlePrediction();
    });
}

// ==========================================
// CHECK PREDICTION AVAILABILITY (6 PM IST)
// ==========================================
function checkPredictionAvailability() {
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const currentHour = istTime.getHours();
    
    const isAvailable = currentHour >= 18 || currentHour < 6;
    
    console.log('Current IST hour:', currentHour);
    console.log('Predictions available:', isAvailable);
    
    return isAvailable;
}

// ==========================================
// HANDLE PREDICTION
// ==========================================
async function handlePrediction() {
    if (state.isProcessing) {
        console.log('⏳ Already processing...');
        return;
    }
    
    state.isProcessing = true;
    
    const predictBtn = document.getElementById('predictBtn');
    const originalText = predictBtn.innerHTML;
    
    try {
        // Disable button
        if (predictBtn) {
            predictBtn.disabled = true;
            predictBtn.innerHTML = '<span>Processing...</span>';
        }
        
        // Hide previous results
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
        
        // Show processing timeline
        await showProcessingTimeline();
        
        // Fetch prediction
        console.log('📡 Fetching prediction...');
        await fetchPrediction();
        
        // Display results
        console.log('📊 Displaying results...');
        displayResults();
        
        console.log('✅ Prediction complete!');
        
    } catch (error) {
        console.error('❌ Prediction error:', error);
        alert('Error: ' + error.message);
    } finally {
        state.isProcessing = false;
        
        if (predictBtn) {
            predictBtn.disabled = false;
            predictBtn.innerHTML = originalText;
        }
        
        // Hide timeline
        const timeline = document.getElementById('processingTimeline');
        if (timeline) {
            setTimeout(() => {
                timeline.style.display = 'none';
            }, 500);
        }
    }
}

// ==========================================
// PROCESSING TIMELINE
// ==========================================
async function showProcessingTimeline() {
    const timeline = document.getElementById('processingTimeline');
    
    if (!timeline) {
        console.error('❌ Timeline not found');
        return;
    }
    
    console.log('⏳ Showing processing timeline');
    
    timeline.style.display = 'block';
    timeline.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Reset all nodes
    const nodes = timeline.querySelectorAll('.timeline-node');
    nodes.forEach(node => {
        node.classList.remove('active', 'completed');
    });
    
    // Animate stages
    const stages = [1, 2, 3, 4, 5];
    
    for (let stage of stages) {
        const node = timeline.querySelector(`[data-stage="${stage}"]`);
        if (!node) continue;
        
        // Activate
        node.classList.add('active');
        console.log('Stage', stage, 'active');
        
        // Animate counters
        if (stage === 2) {
            animateCounter('dataCounter', 47, 800);
        } else if (stage === 4) {
            animateCounter('confidenceCounter', 95, 800);
        }
        
        // Wait
        await sleep(1000);
        
        // Complete
        node.classList.remove('active');
        node.classList.add('completed');
    }
    
    console.log('✅ Timeline animation complete');
}

function animateCounter(elementId, targetValue, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const increment = targetValue / (duration / 30);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            element.textContent = targetValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// FETCH PREDICTION FROM BACKEND
// ==========================================
async function fetchPrediction() {
    const url = `${CONFIG.API_URL}/predict/${state.selectedBeach}`;
    console.log('Fetching:', url);
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Response:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch prediction');
        }
        
        // Check availability
        if (data.data.weather.available === false) {
            const hours = data.data.weather.timeUntilAvailable.hours;
            const minutes = data.data.weather.timeUntilAvailable.minutes;
            throw new Error(`⏰ Predictions available after 6 PM IST\n\nAvailable in: ${hours}h ${minutes}m\n\nSign up for daily 4 AM email updates below!`);
        }
        
        state.weatherData = data.data.weather;
        state.photographyInsights = data.data.photography;
        
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// ==========================================
// DISPLAY RESULTS
// ==========================================
function displayResults() {
    const resultsSection = document.getElementById('resultsSection');
    
    if (!resultsSection) {
        console.error('❌ Results section not found');
        return;
    }
    
    // Show results
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Update all sections
    updateVerdictCard();
    updateWeatherCards();
    updatePhotographyPanel();
    
    console.log('✅ Results displayed');
}

// ==========================================
// UPDATE VERDICT CARD
// ==========================================
function updateVerdictCard() {
    const verdict = state.weatherData.prediction.verdict;
    const score = state.weatherData.prediction.score;
    const beach = state.weatherData.beach;
    
    console.log('Verdict:', verdict, 'Score:', score);
    
    // Update text content
    setText('verdictText', verdict);
    setText('verdictScore', score + '%');
    setText('beachName', beach);
    setText('predictionDescription', getVerdictDescription(verdict));
    
    // Update verdict card class
    const verdictCard = document.querySelector('.verdict-card');
    if (verdictCard) {
        verdictCard.className = 'verdict-card verdict-' + verdict.toLowerCase().replace(' ', '-');
    }
}

// ==========================================
// UPDATE WEATHER CARDS
// ==========================================
function updateWeatherCards() {
    const forecast = state.weatherData.forecast;
    const factors = state.weatherData.prediction.factors;
    
    console.log('Updating weather cards');
    
    // Visibility
    setText('visibilityValue', forecast.visibility.toFixed(1) + ' km');
    setText('visibilityStatus', factors.visibility);
    
    // Wind
    setText('windValue', forecast.windSpeed + ' km/h');
    setText('windStatus', factors.wind);
    
    // Cloud
    setText('cloudValue', forecast.cloudCover + '%');
    setText('cloudStatus', factors.cloudCover);
    
    // Humidity
    setText('humidityValue', forecast.humidity + '%');
    setText('humidityStatus', getHumidityStatus(forecast.humidity));
    
    // AQI
    setText('aqiValue', 'Good');
    setText('aqiStatus', 'UV: ' + (forecast.uvIndex || 3));
}

// ==========================================
// UPDATE PHOTOGRAPHY PANEL
// ==========================================
function updatePhotographyPanel() {
    const insights = state.photographyInsights;
    
    console.log('Updating photography panel');
    
    // Greeting
    setText('photographyGreeting', insights.greeting || '🌅 Perfect Conditions!');
    
    // Camera Settings
    setText('isoValue', insights.cameraSettings.iso);
    setText('shutterValue', insights.cameraSettings.shutterSpeed);
    setText('apertureValue', insights.cameraSettings.aperture);
    setText('whiteBalanceValue', insights.cameraSettings.whiteBalance);
    
    // Golden Hour
    setText('goldenHourStart', insights.goldenHour.start);
    setText('goldenHourEnd', insights.goldenHour.end);
    setText('goldenHourQuality', insights.goldenHour.quality);
    
    // Composition Tips
    const tipsList = document.getElementById('compositionTipsList');
    if (tipsList) {
        tipsList.innerHTML = '';
        insights.compositionTips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsList.appendChild(li);
        });
    }
}

// ==========================================
// PHOTOGRAPHY TABS
// ==========================================
function initializePhotographyTabs() {
    const toggleBtn = document.getElementById('togglePhotography');
    const panel = document.getElementById('photographyPanel');
    
    if (toggleBtn && panel) {
        toggleBtn.addEventListener('click', function() {
            panel.classList.toggle('active');
        });
    }
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            const content = document.querySelector(`[data-tab-content="${tabName}"]`);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

// ==========================================
// EMAIL MODAL
// ==========================================
function initializeEmailModal() {
    const openBtn = document.getElementById('openEmailModal');
    const closeBtn = document.getElementById('closeModal');
    const modal = document.getElementById('emailModal');
    const form = document.getElementById('subscriptionForm');
    
    if (openBtn && modal) {
        openBtn.addEventListener('click', function() {
            console.log('📧 Opening email modal');
            modal.classList.add('active');
        });
    }
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            console.log('Closing email modal');
            modal.classList.remove('active');
        });
    }
    
    // Close on overlay click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Handle form submission
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleEmailSubscription();
        });
    }
}

async function handleEmailSubscription() {
    const emailInput = document.getElementById('emailInput');
    const beachSelect = document.getElementById('beachSelect');
    const messageDiv = document.getElementById('subscribeMessage');
    const submitBtn = document.querySelector('#subscriptionForm button[type="submit"]');
    
    const email = emailInput.value.trim();
    const beach = beachSelect.value;
    
    if (!email) {
        showMessage(messageDiv, 'Please enter your email', 'error');
        return;
    }
    
    console.log('📧 Subscribing:', email, 'to', beach);
    
    // Disable form
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Subscribing...</span>';
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                preferredBeach: beach
            })
        });
        
        const data = await response.json();
        console.log('Subscription response:', data);
        
        if (data.success) {
            showMessage(messageDiv, '✅ Subscribed! Check your email.', 'success');
            emailInput.value = '';
            
            // Close modal after 2 seconds
            setTimeout(() => {
                const modal = document.getElementById('emailModal');
                if (modal) modal.classList.remove('active');
            }, 2000);
        } else {
            showMessage(messageDiv, data.message || 'Subscription failed', 'error');
        }
        
    } catch (error) {
        console.error('Subscription error:', error);
        showMessage(messageDiv, 'Failed to subscribe. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Subscribe for Free</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
}

function showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = 'form-message ' + type;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================
function setText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

function getVerdictDescription(verdict) {
    const descriptions = {
        'EXCELLENT': 'Exceptional conditions for sunrise photography. Crystal clear skies and optimal visibility.',
        'GOOD': 'Great conditions for capturing sunrise. Clear visibility with minimal cloud cover.',
        'FAIR': 'Decent conditions. Some clouds may add drama but visibility should be adequate.',
        'POOR': 'Challenging conditions. Heavy clouds or low visibility may limit sunrise views.',
        'VERY POOR': 'Unfavorable conditions. Consider waiting for better weather.'
    };
    return descriptions[verdict] || 'Weather conditions analyzed.';
}

function getHumidityStatus(humidity) {
    if (humidity < 40) return 'Low';
    if (humidity < 70) return 'Moderate';
    return 'High';
}

// ==========================================
// FINAL LOG
// ==========================================
console.log('✅ Seaside Beacon script loaded successfully!');
console.log('API URL:', CONFIG.API_URL);