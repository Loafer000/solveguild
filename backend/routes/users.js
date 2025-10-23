const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.getPublicProfile() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('profile.skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('profile.experience')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Experience must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { profile } = req.body;
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', [
  query('q').optional().isString(),
  query('role').optional().isIn(['client', 'freelancer', 'both']),
  query('skills').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, role, skills, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { isActive: true };
    
    if (role) filter.role = role;
    
    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { 'profile.firstName': { $regex: q, $options: 'i' } },
        { 'profile.lastName': { $regex: q, $options: 'i' } }
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filter['profile.skills'] = { $in: skillsArray };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select('username profile.firstName profile.lastName profile.avatar profile.skills profile.rating role')
      .sort({ 'profile.rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.getPublicProfile() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, async (req, res) => {
  try {
    // In a real application, you would handle file upload here
    // For now, we'll just return a success message
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profile.avatar = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar updated successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error during avatar upload' });
  }
});

// @route   POST /api/users/portfolio
// @desc    Add portfolio item
// @access  Private
router.post('/portfolio', auth, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('link')
    .optional()
    .isURL()
    .withMessage('Link must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, image, link } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const portfolioItem = {
      title,
      description,
      image,
      link
    };

    user.profile.portfolio.push(portfolioItem);
    await user.save();

    res.json({
      message: 'Portfolio item added successfully',
      portfolio: user.profile.portfolio
    });
  } catch (error) {
    console.error('Add portfolio error:', error);
    res.status(500).json({ message: 'Server error during portfolio addition' });
  }
});

// @route   DELETE /api/users/portfolio/:index
// @desc    Remove portfolio item
// @access  Private
router.delete('/portfolio/:index', auth, async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (index < 0 || index >= user.profile.portfolio.length) {
      return res.status(400).json({ message: 'Invalid portfolio index' });
    }

    user.profile.portfolio.splice(index, 1);
    await user.save();

    res.json({
      message: 'Portfolio item removed successfully',
      portfolio: user.profile.portfolio
    });
  } catch (error) {
    console.error('Remove portfolio error:', error);
    res.status(500).json({ message: 'Server error during portfolio removal' });
  }
});

// @route   POST /api/users/rate
// @desc    Rate a user
// @access  Private
router.post('/rate', auth, [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, rating, review } = req.body;

    if (userId === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update rating
    const currentRating = user.profile.rating;
    const newCount = currentRating.count + 1;
    const newAverage = ((currentRating.average * currentRating.count) + rating) / newCount;

    user.profile.rating = {
      average: Math.round(newAverage * 10) / 10, // Round to 1 decimal place
      count: newCount
    };

    await user.save();

    res.json({
      message: 'Rating submitted successfully',
      rating: user.profile.rating
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({ message: 'Server error during rating submission' });
  }
});

module.exports = router;
