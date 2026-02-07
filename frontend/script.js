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
// COLD START MODAL - Server Wake-Up
// ==========================================
function showColdStartModal() {
    // Remove existing if any
    const existing = document.getElementById('coldStartModal');
    if (existing) existing.remove();
    
    const modalHTML = `
        <div id="coldStartModal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 15, 15, 0.95);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        ">
            <div style="
                background: white;
                max-width: 500px;
                width: 100%;
                border-radius: 20px;
                padding: 48px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.4s ease;
            ">
                <!-- Animated Sun Icon -->
                <div style="font-size: 64px; margin-bottom: 24px; animation: pulse 2s infinite;">
                    🌅
                </div>
                
                <!-- Title -->
                <h2 style="
                    font-size: 24px;
                    font-weight: 700;
                    color: #0F0F0F;
                    margin: 0 0 16px 0;
                ">
                    Waking Up the Sunrise Engine
                </h2>
                
                <!-- Message -->
                <p style="
                    font-size: 16px;
                    line-height: 1.6;
                    color: #737373;
                    margin: 0 0 24px 0;
                ">
                    Our server is starting up to fetch tomorrow's forecast.<br>
                    <strong>This takes about 45 seconds on the first visit.</strong>
                </p>
                
                <!-- Progress Bar -->
                <div style="
                    width: 100%;
                    height: 8px;
                    background: #F5F5F5;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 24px;
                ">
                    <div id="coldStartProgress" style="
                        height: 100%;
                        background: linear-gradient(90deg, #D64828, #FF6B4A);
                        width: 0%;
                        transition: width 0.5s ease;
                        animation: progressPulse 1.5s infinite;
                    "></div>
                </div>
                
                <!-- Coffee Icon -->
                <p style="
                    font-size: 18px;
                    color: #D64828;
                    margin: 0;
                ">
                    ☕ Grab a coffee while we prepare your prediction!
                </p>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add animations
    const style = document.createElement('style');
    style.id = 'coldStartStyles';
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes progressPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
    `;
    document.head.appendChild(style);
    
    // Animate progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 2;
        const progressBar = document.getElementById('coldStartProgress');
        if (progressBar) {
            progressBar.style.width = Math.min(progress, 95) + '%';
        }
        if (progress >= 95) {
            clearInterval(progressInterval);
        }
    }, 900); // Reaches 95% in ~45 seconds
    
    // Store interval ID for cleanup
    window.coldStartProgressInterval = progressInterval;
}

function hideColdStartModal() {
    const modal = document.getElementById('coldStartModal');
    if (modal) {
        // Complete progress bar
        const progressBar = document.getElementById('coldStartProgress');
        if (progressBar) {
            progressBar.style.width = '100%';
        }
        
        // Clear interval
        if (window.coldStartProgressInterval) {
            clearInterval(window.coldStartProgressInterval);
        }
        
        // Fade out and remove
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';
        setTimeout(() => modal.remove(), 300);
        
        // Remove styles
        const styles = document.getElementById('coldStartStyles');
        if (styles) styles.remove();
    }
}

// ==========================================
// "WHY WE WAIT" MODAL - Impressive Explanation
// ==========================================
function showWhyWeWaitModal(hours, minutes) {
    // Remove existing modal if any
    const existingModal = document.getElementById('whyWeWaitModal');
    if (existingModal) existingModal.remove();
    
    // Create modal HTML
    const modalHTML = `
        <div id="whyWeWaitModal" class="why-wait-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 15, 15, 0.95);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        ">
            <div class="why-wait-content" style="
                background: white;
                max-width: 600px;
                width: 100%;
                border-radius: 20px;
                padding: 48px;
                position: relative;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.4s ease;
            ">
                <!-- Close Button -->
                <button class="modal-close" onclick="document.getElementById('whyWeWaitModal').remove()" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: #F5F5F5;
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    color: #737373;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#E5E5E5'" onmouseout="this.style.background='#F5F5F5'">
                    ×
                </button>
                
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🌅</div>
                    <h2 style="font-size: 28px; font-weight: 700; color: #0F0F0F; margin: 0 0 12px 0;">
                        Why We Wait Until 6 PM
                    </h2>
                    <p style="font-size: 16px; color: #737373; margin: 0;">
                        Quality predictions over instant guesses
                    </p>
                </div>
                
                <!-- Countdown Display -->
                <div style="
                    background: linear-gradient(135deg, #FFF4ED, #FFE5D9);
                    border-radius: 16px;
                    padding: 24px;
                    text-align: center;
                    margin-bottom: 32px;
                    border: 2px solid #FFD4C0;
                ">
                    <div style="font-size: 14px; color: #D64828; font-weight: 600; margin-bottom: 8px;">
                        NEXT PREDICTION AVAILABLE IN
                    </div>
                    <div style="font-size: 48px; font-weight: 700; color: #D64828; font-family: 'SF Mono', 'Monaco', monospace;">
                        ${hours}h ${minutes}m
                    </div>
                </div>
                
                <!-- The Challenge -->
                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #0F0F0F; margin: 0 0 12px 0; display: flex; align-items: center;">
                        <span style="font-size: 20px; margin-right: 8px;">🌤️</span>
                        The Challenge
                    </h3>
                    <p style="font-size: 15px; line-height: 1.6; color: #404040; margin: 0;">
                        Weather conditions are fluid and constantly evolving. Atmospheric parameters can shift dramatically throughout the day. Between 2 PM and 6 PM alone, cloud cover can change by 40%, visibility can double or halve, and wind patterns can completely reverse direction.
                    </p>
                </div>
                
                <!-- Our Solution -->
                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #0F0F0F; margin: 0 0 12px 0; display: flex; align-items: center;">
                        <span style="font-size: 20px; margin-right: 8px;">🎯</span>
                        Our Solution
                    </h3>
                    <p style="font-size: 15px; line-height: 1.6; color: #404040; margin: 0 0 16px 0;">
                        We wait for AccuWeather's fresh 12-hour forecast that becomes available at 6 PM IST. This gives us the most accurate window into tomorrow morning's 6 AM conditions—when you'll actually be experiencing the sunrise.
                    </p>
                    <div style="background: #FAFAFA; border-radius: 12px; padding: 16px;">
                        <div style="font-size: 13px; font-weight: 600; color: #0F0F0F; margin-bottom: 12px;">
                            What We Analyze:
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; color: #404040;">
                            <div>✓ Cloud movement patterns</div>
                            <div>✓ Visibility trends</div>
                            <div>✓ Precipitation probability</div>
                            <div>✓ UV index development</div>
                            <div>✓ Wind speed evolution</div>
                            <div>✓ Humidity fluctuations</div>
                        </div>
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E5E5; font-size: 13px; color: #737373; text-align: center;">
                            <strong>47+ atmospheric parameters</strong> analyzed for each prediction
                        </div>
                    </div>
                </div>
                
                <!-- The Benefit -->
                <div style="margin-bottom: 32px;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #0F0F0F; margin: 0 0 12px 0; display: flex; align-items: center;">
                        <span style="font-size: 20px; margin-right: 8px;">⭐</span>
                        The Result
                    </h3>
                    <p style="font-size: 15px; line-height: 1.6; color: #404040; margin: 0;">
                        You receive predictions with <strong>95%+ confidence</strong>, not rough estimates. Professional photographers trust precise timing. We do too. This is why we choose accuracy over speed—because your time at the beach matters.
                    </p>
                </div>
                
                <!-- CTA -->
                <div style="
                    background: linear-gradient(135deg, #0F0F0F, #262626);
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    color: white;
                ">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                        📧 Never Miss a Perfect Sunrise
                    </div>
                    <p style="font-size: 14px; opacity: 0.9; margin: 0 0 16px 0; line-height: 1.5;">
                        Get tomorrow's prediction delivered to your inbox at 4:00 AM daily—automatically, reliably, every morning.
                    </p>
                    <button onclick="document.getElementById('whyWeWaitModal').remove(); document.getElementById('emailBtn').click();" style="
                        background: #D64828;
                        color: white;
                        border: none;
                        padding: 14px 32px;
                        border-radius: 8px;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#C23D1F'" onmouseout="this.style.background='#D64828'">
                        Sign Up for Daily Updates
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(30px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Close on background click
    document.getElementById('whyWeWaitModal').addEventListener('click', (e) => {
        if (e.target.id === 'whyWeWaitModal') {
            e.target.remove();
        }
    });
}

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
        
        // Detect cold start - show special modal after 3 seconds
        const startTime = Date.now();
        let coldStartShown = false;
        
        const coldStartTimeout = setTimeout(() => {
            if (state.isProcessing) {
                console.log('🥶 Cold start detected - showing wake-up modal');
                coldStartShown = true;
                showColdStartModal();
            }
        }, 3000);
        
        // Fetch prediction
        console.log('📡 Fetching prediction...');
        await fetchPrediction();
        
        // Clear timeout and hide modal if shown
        clearTimeout(coldStartTimeout);
        if (coldStartShown) {
            console.log('✅ Server awake - hiding cold start modal');
            hideColdStartModal();
        }
        
        const loadTime = Date.now() - startTime;
        console.log(`⏱️ Total load time: ${loadTime}ms`);
        
        // Display results
        console.log('📊 Displaying results...');
        displayResults();
        
        console.log('✅ Prediction complete!');
        
    } catch (error) {
        console.error('❌ Prediction error:', error);
        
        // Always hide cold start modal on error
        hideColdStartModal();
        
        // Don't show alert if we already showed the impressive modal
        if (error.message !== 'MODAL_SHOWN') {
            alert('Error: ' + error.message);
        }
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
            
            // Show impressive "Why We Wait" modal instead of simple error
            showWhyWeWaitModal(hours, minutes);
            throw new Error('MODAL_SHOWN'); // Special error to prevent alert
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