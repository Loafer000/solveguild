const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Doubt = require('../models/Doubt');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/doubts
// @desc    Create a new doubt
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 50, max: 10000 })
    .withMessage('Content must be between 50 and 10000 characters'),
  body('category')
    .isIn([
      'programming', 'web-development', 'mobile-development', 'data-science',
      'ai-ml', 'cybersecurity', 'blockchain', 'game-development', 'ui-ux-design',
      'devops', 'database', 'cloud-computing', 'networking', 'hardware', 'other'
    ])
    .withMessage('Invalid category'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      category,
      tags = [],
      attachments = [],
      media = [],
      difficulty = 'beginner',
      priority = 'medium',
      bounty = null
    } = req.body;

    const doubt = new Doubt({
      author: req.userId,
      title,
      content,
      category,
      tags,
      attachments,
      media,
      difficulty,
      priority,
      bounty: bounty ? {
        amount: bounty.amount,
        currency: bounty.currency || 'USD',
        isActive: true
      } : null
    });

    await doubt.save();

    // Notify users interested in this category
    const interestedUsers = await User.find({
      'profile.skills': { $in: tags.length > 0 ? tags : [category] },
      _id: { $ne: req.userId }
    });

    // Create notifications for interested users
    const notifications = interestedUsers.slice(0, 50).map(user => ({
      user: user._id,
      type: 'new_doubt',
      title: 'New Doubt in Your Area',
      message: `A new doubt has been posted in ${category}: ${title}`,
      data: { doubtId: doubt._id },
      priority: priority === 'urgent' ? 'high' : 'medium'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: 'Doubt posted successfully',
      doubt
    });
  } catch (error) {
    console.error('Create doubt error:', error);
    res.status(500).json({ message: 'Server error during doubt creation' });
  }
});

// @route   GET /api/doubts
// @desc    Get all doubts with filtering and pagination
// @access  Public
router.get('/', [
  query('category').optional().isString(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('isResolved').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sort').optional().isIn(['newest', 'oldest', 'popular', 'unanswered'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category,
      difficulty,
      priority,
      isResolved,
      page = 1,
      limit = 20,
      sort = 'newest',
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (priority) filter.priority = priority;
    if (isResolved !== undefined) filter.isResolved = isResolved === 'true';
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'popular':
        sortObj = { upvotes: -1, createdAt: -1 };
        break;
      case 'unanswered':
        sortObj = { answerCount: 1, createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const doubts = await Doubt.find(filter)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Doubt.countDocuments(filter);

    res.json({
      doubts,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get doubts error:', error);
    res.status(500).json({ message: 'Server error while fetching doubts' });
  }
});

// @route   GET /api/doubts/:id
// @desc    Get single doubt by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar profile.rating')
      .populate('answers.author', 'username profile.firstName profile.lastName profile.avatar profile.rating');

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Increment view count
    doubt.views += 1;
    await doubt.save();

    res.json({ doubt });
  } catch (error) {
    console.error('Get doubt error:', error);
    res.status(500).json({ message: 'Server error while fetching doubt' });
  }
});

// @route   POST /api/doubts/:id/answers
// @desc    Add answer to doubt
// @access  Private
router.post('/:id/answers', auth, [
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Answer must be between 10 and 5000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    const { content, attachments = [] } = req.body;

    // Add answer
    await doubt.addAnswer(req.userId, content, attachments);

    // Notify doubt author
    if (doubt.author.toString() !== req.userId.toString()) {
      await Notification.createNotification(
        doubt.author,
        'new_doubt_answer',
        'New Answer to Your Doubt',
        `Someone answered your doubt: ${doubt.title}`,
        { doubtId: doubt._id }
      );
    }

    res.status(201).json({ message: 'Answer added successfully' });
  } catch (error) {
    console.error('Add answer error:', error);
    res.status(500).json({ message: 'Server error during answer submission' });
  }
});

// @route   POST /api/doubts/:id/vote
// @desc    Vote on doubt
// @access  Private
router.post('/:id/vote', auth, [
  body('voteType')
    .isIn(['upvote', 'downvote', 'remove'])
    .withMessage('Invalid vote type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    const { voteType } = req.body;

    if (voteType === 'remove') {
      // Remove existing votes
      doubt.upvotes = doubt.upvotes.filter(id => !id.equals(req.userId));
      doubt.downvotes = doubt.downvotes.filter(id => !id.equals(req.userId));
    } else {
      await doubt.vote(req.userId, voteType);
    }

    await doubt.save();

    res.json({ 
      message: 'Vote recorded successfully',
      voteScore: doubt.voteScore
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error during voting' });
  }
});

// @route   POST /api/doubts/:id/answers/:answerIndex/vote
// @desc    Vote on answer
// @access  Private
router.post('/:id/answers/:answerIndex/vote', auth, [
  body('voteType')
    .isIn(['upvote', 'downvote', 'remove'])
    .withMessage('Invalid vote type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    const answerIndex = parseInt(req.params.answerIndex);
    const { voteType } = req.body;

    if (voteType === 'remove') {
      // Remove existing votes
      const answer = doubt.answers[answerIndex];
      if (answer) {
        answer.upvotes = answer.upvotes.filter(id => !id.equals(req.userId));
        answer.downvotes = answer.downvotes.filter(id => !id.equals(req.userId));
      }
    } else {
      await doubt.voteAnswer(answerIndex, req.userId, voteType);
    }

    await doubt.save();

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ message: 'Server error during voting' });
  }
});

// @route   POST /api/doubts/:id/accept-answer
// @desc    Accept an answer
// @access  Private (Doubt author only)
router.post('/:id/accept-answer', auth, [
  body('answerIndex')
    .isInt({ min: 0 })
    .withMessage('Valid answer index is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user is the author
    if (doubt.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept answer' });
    }

    const { answerIndex } = req.body;

    // Accept answer
    await doubt.acceptAnswer(answerIndex);

    // Notify answer author
    const answer = doubt.answers[answerIndex];
    if (answer && answer.author.toString() !== req.userId.toString()) {
      await Notification.createNotification(
        answer.author,
        'answer_accepted',
        'Your Answer Was Accepted',
        `Your answer to "${doubt.title}" was accepted by the author!`,
        { doubtId: doubt._id },
        { isImportant: true, priority: 'high' }
      );
    }

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ message: 'Server error during answer acceptance' });
  }
});

// @route   PUT /api/doubts/:id
// @desc    Update doubt
// @access  Private (Author only)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 10, max: 200 }),
  body('content').optional().trim().isLength({ min: 50, max: 10000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user is the author
    if (doubt.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this doubt' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        doubt[key] = updates[key];
      }
    });

    await doubt.save();

    res.json({
      message: 'Doubt updated successfully',
      doubt
    });
  } catch (error) {
    console.error('Update doubt error:', error);
    res.status(500).json({ message: 'Server error during doubt update' });
  }
});

// @route   DELETE /api/doubts/:id
// @desc    Delete doubt
// @access  Private (Author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user is the author
    if (doubt.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this doubt' });
    }

    await Doubt.findByIdAndDelete(req.params.id);

    res.json({ message: 'Doubt deleted successfully' });
  } catch (error) {
    console.error('Delete doubt error:', error);
    res.status(500).json({ message: 'Server error during doubt deletion' });
  }
});

module.exports = router;
