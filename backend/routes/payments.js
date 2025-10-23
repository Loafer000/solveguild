const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Premium plans configuration
const PREMIUM_PLANS = {
  monthly: {
    name: 'Monthly Premium',
    price: 299,
    duration: 30, // days
    features: [
      'Enhanced visibility for your issues',
      'Priority support',
      'Advanced analytics',
      'Custom branding'
    ]
  },
  quarterly: {
    name: 'Quarterly Premium',
    price: 799,
    duration: 90,
    features: [
      'All Monthly features',
      'Early access to new features',
      'Priority customer support',
      'Custom profile themes'
    ]
  },
  'semi-annual': {
    name: 'Semi-Annual Premium',
    price: 1499,
    duration: 180,
    features: [
      'All Quarterly features',
      'Exclusive premium community',
      'Advanced project management tools',
      'Priority in search results'
    ]
  },
  annual: {
    name: 'Annual Premium',
    price: 2499,
    duration: 365,
    features: [
      'All Semi-Annual features',
      'Lifetime access to premium features',
      'Personal account manager',
      'Custom integrations'
    ]
  }
};

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', auth, [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('currency')
    .isString()
    .withMessage('Currency is required'),
  body('planId')
    .isIn(['monthly', 'quarterly', 'semi-annual', 'annual'])
    .withMessage('Invalid plan ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency, planId, planName } = req.body;

    // Create order data
    const orderData = {
      amount: amount,
      currency: currency,
      receipt: `order_${Date.now()}_${req.userId}`,
      notes: {
        planId: planId,
        planName: planName,
        userId: req.userId.toString()
      }
    };

    // In a real application, you would create the order using Razorpay API
    // For now, we'll simulate the order creation
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      currency: currency,
      receipt: orderData.receipt,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000)
    };

    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error during order creation' });
  }
});

// @route   POST /api/payments/verify-payment
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify-payment', auth, [
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required'),
  body('signature')
    .notEmpty()
    .withMessage('Signature is required'),
  body('planId')
    .isIn(['monthly', 'quarterly', 'semi-annual', 'annual'])
    .withMessage('Invalid plan ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId, orderId, signature, planId } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }

    // Get user and update subscription
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const plan = PREMIUM_PLANS[planId];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Update user subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    user.premium = {
      isActive: true,
      plan: planId,
      startDate,
      endDate,
      autoRenew: true,
      paymentId,
      orderId
    };

    await user.save();

    // In a real application, you would:
    // 1. Verify payment with Razorpay API
    // 2. Create subscription record
    // 3. Send confirmation email
    // 4. Update user subscription status

    res.json({
      success: true,
      message: 'Payment verified successfully',
      subscription: {
        plan: planId,
        startDate,
        endDate,
        features: plan.features
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error during payment verification' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Razorpay webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        console.log('Payment captured:', event.payload.payment.entity);
        break;
      case 'payment.failed':
        console.log('Payment failed:', event.payload.payment.entity);
        break;
      case 'subscription.activated':
        console.log('Subscription activated:', event.payload.subscription.entity);
        break;
      case 'subscription.cancelled':
        console.log('Subscription cancelled:', event.payload.subscription.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// @route   GET /api/payments/plans
// @desc    Get available payment plans
// @access  Public
router.get('/plans', (req, res) => {
  try {
    const plans = Object.keys(PREMIUM_PLANS).map(key => ({
      id: key,
      ...PREMIUM_PLANS[key]
    }));

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error while fetching plans' });
  }
});

// @route   POST /api/payments/cancel-subscription
// @desc    Cancel subscription
// @access  Private
router.post('/cancel-subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.premium.isActive) {
      return res.status(400).json({ 
        message: 'No active subscription found' 
      });
    }

    // Disable auto-renewal
    user.premium.autoRenew = false;
    await user.save();

    res.json({ 
      message: 'Subscription will not auto-renew',
      subscription: {
        plan: user.premium.plan,
        endDate: user.premium.endDate,
        autoRenew: false
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error during cancellation' });
  }
});

module.exports = router;
