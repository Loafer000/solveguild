const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Premium plans configuration
const PREMIUM_PLANS = {
  monthly: {
    name: 'Monthly Premium',
    price: 9.99,
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
    price: 24.99,
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
    price: 49.99,
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
    price: 89.99,
    duration: 365,
    features: [
      'All Semi-Annual features',
      'Lifetime access to premium features',
      'Personal account manager',
      'Custom integrations'
    ]
  }
};

// @route   GET /api/premium/plans
// @desc    Get all premium plans
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

// @route   GET /api/premium/plans/:planId
// @desc    Get specific premium plan
// @access  Public
router.get('/plans/:planId', (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!PREMIUM_PLANS[planId]) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const plan = {
      id: planId,
      ...PREMIUM_PLANS[planId]
    };

    res.json({ plan });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Server error while fetching plan' });
  }
});

// @route   POST /api/premium/subscribe
// @desc    Subscribe to premium plan
// @access  Private
router.post('/subscribe', auth, [
  body('planId')
    .isIn(['monthly', 'quarterly', 'semi-annual', 'annual'])
    .withMessage('Invalid plan ID'),
  body('paymentMethodId')
    .notEmpty()
    .withMessage('Payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId, paymentMethodId } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has active subscription
    if (user.premium.isActive && new Date(user.premium.endDate) > new Date()) {
      return res.status(400).json({ 
        message: 'You already have an active premium subscription' 
      });
    }

    const plan = PREMIUM_PLANS[planId];
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // In a real application, you would:
    // 1. Create a Stripe subscription
    // 2. Handle payment processing
    // 3. Set up webhooks for subscription events
    
    // For now, we'll simulate successful subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    user.premium = {
      isActive: true,
      plan: planId,
      startDate,
      endDate,
      autoRenew: true
    };

    await user.save();

    res.json({
      message: 'Premium subscription activated successfully',
      subscription: {
        plan: planId,
        startDate,
        endDate,
        features: plan.features
      }
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error during subscription' });
  }
});

// @route   POST /api/premium/cancel
// @desc    Cancel premium subscription
// @access  Private
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.premium.isActive) {
      return res.status(400).json({ 
        message: 'No active premium subscription found' 
      });
    }

    // Disable auto-renewal
    user.premium.autoRenew = false;
    await user.save();

    res.json({ 
      message: 'Premium subscription will not auto-renew',
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

// @route   GET /api/premium/status
// @desc    Get premium subscription status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isActive = user.premium.isActive && new Date(user.premium.endDate) > new Date();
    
    res.json({
      isActive,
      subscription: isActive ? {
        plan: user.premium.plan,
        startDate: user.premium.startDate,
        endDate: user.premium.endDate,
        autoRenew: user.premium.autoRenew,
        features: PREMIUM_PLANS[user.premium.plan]?.features || []
      } : null
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ message: 'Server error while fetching status' });
  }
});

// @route   POST /api/premium/upgrade
// @desc    Upgrade premium subscription
// @access  Private
router.post('/upgrade', auth, [
  body('newPlanId')
    .isIn(['monthly', 'quarterly', 'semi-annual', 'annual'])
    .withMessage('Invalid plan ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newPlanId } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.premium.isActive) {
      return res.status(400).json({ 
        message: 'No active premium subscription to upgrade' 
      });
    }

    const newPlan = PREMIUM_PLANS[newPlanId];
    if (!newPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Calculate prorated amount and extend subscription
    const remainingDays = Math.ceil((new Date(user.premium.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + newPlan.duration);

    user.premium.plan = newPlanId;
    user.premium.endDate = newEndDate;

    await user.save();

    res.json({
      message: 'Premium subscription upgraded successfully',
      subscription: {
        plan: newPlanId,
        endDate: newEndDate,
        features: newPlan.features
      }
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ message: 'Server error during upgrade' });
  }
});

// @route   GET /api/premium/benefits
// @desc    Get premium benefits for current user
// @access  Private
router.get('/benefits', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isActive = user.premium.isActive && new Date(user.premium.endDate) > new Date();
    
    const benefits = {
      enhancedVisibility: isActive,
      earlyNotifications: isActive,
      prioritySupport: isActive,
      advancedAnalytics: isActive,
      customBranding: isActive && ['quarterly', 'semi-annual', 'annual'].includes(user.premium.plan),
      exclusiveCommunity: isActive && ['semi-annual', 'annual'].includes(user.premium.plan),
      accountManager: isActive && user.premium.plan === 'annual'
    };

    res.json({ benefits });
  } catch (error) {
    console.error('Get benefits error:', error);
    res.status(500).json({ message: 'Server error while fetching benefits' });
  }
});

module.exports = router;
