// ==========================================
// Subscribe Routes
// ==========================================

const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const emailService = require('../services/emailService');

/**
 * POST /api/subscribe
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email, preferredBeach } = req.body;

    if (!email || !preferredBeach) {
      return res.status(400).json({
        success: false,
        message: 'Email and preferred beach are required'
      });
    }

    // Check if already subscribed
    let subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (subscriber) {
      if (subscriber.isActive) {
        return res.json({
          success: false,
          message: 'Already subscribed'
        });
      } else {
        // Reactivate
        subscriber.isActive = true;
        subscriber.preferredBeach = preferredBeach;
        await subscriber.save();
      }
    } else {
      // Create new subscriber
      subscriber = new Subscriber({
        email: email.toLowerCase(),
        preferredBeach
      });
      await subscriber.save();
    }

    // Send welcome email
    await emailService.sendWelcomeEmail(subscriber.email, subscriber.preferredBeach);

    console.log(`✅ New subscriber: ${email}`);

    res.json({
      success: true,
      message: 'Successfully subscribed! Check your email.'
    });
  } catch (error) {
    console.error('Subscribe error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Subscription failed'
    });
  }
});

/**
 * POST /api/unsubscribe
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.json({
        success: false,
        message: 'Email not found'
      });
    }

    subscriber.isActive = false;
    await subscriber.save();

    console.log(`👋 Unsubscribed: ${email}`);

    res.json({
      success: true,
      message: 'Successfully unsubscribed'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unsubscribe failed'
    });
  }
});

module.exports = router;
