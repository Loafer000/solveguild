const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Issue = require('../models/Issue');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/issues
// @desc    Create a new issue
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  body('category')
    .isIn([
      'logo-design', 'video-editing', 'app-development', 'web-development',
      'ai-ml', 'data-science', 'cybersecurity', 'blockchain', 'game-development',
      'ui-ux-design', 'digital-marketing', 'content-writing', 'translation',
      'voice-over', 'photography', 'other'
    ])
    .withMessage('Invalid category'),
  body('budget.min')
    .isNumeric()
    .withMessage('Minimum budget must be a number'),
  body('budget.max')
    .isNumeric()
    .withMessage('Maximum budget must be a number'),
  body('timeline')
    .isIn(['urgent', '1-week', '2-weeks', '1-month', '2-months', '3-months', 'flexible'])
    .withMessage('Invalid timeline')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      budget,
      timeline,
      requirements = [],
      skills = [],
      attachments = [],
      tags = [],
      deadline,
      location = 'remote'
    } = req.body;

    // Validate budget
    if (budget.min >= budget.max) {
      return res.status(400).json({ message: 'Minimum budget must be less than maximum budget' });
    }

    const issue = new Issue({
      client: req.userId,
      title,
      description,
      category,
      budget,
      timeline,
      requirements,
      skills,
      attachments,
      tags,
      deadline,
      location
    });

    await issue.save();

    // Notify premium freelancers in the category
    const premiumFreelancers = await User.find({
      role: { $in: ['freelancer', 'both'] },
      'premium.isActive': true,
      'profile.skills': { $in: skills.length > 0 ? skills : [category] }
    });

    // Create notifications for premium freelancers
    const notifications = premiumFreelancers.map(freelancer => ({
      user: freelancer._id,
      type: 'new_issue_premium',
      title: 'New Premium Issue Available',
      message: `A new issue in ${category} has been posted and is available for premium members`,
      data: { issueId: issue._id },
      priority: 'high',
      isImportant: true
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ message: 'Server error during issue creation' });
  }
});

// @route   GET /api/issues
// @desc    Get all issues with filtering and pagination
// @access  Public
router.get('/', [
  query('category').optional().isString(),
  query('status').optional().isIn(['open', 'in-progress', 'completed', 'cancelled', 'disputed']),
  query('minBudget').optional().isNumeric(),
  query('maxBudget').optional().isNumeric(),
  query('timeline').optional().isString(),
  query('location').optional().isIn(['remote', 'onsite', 'hybrid']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sort').optional().isIn(['newest', 'oldest', 'budget-high', 'budget-low', 'deadline'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category,
      status = 'open',
      minBudget,
      maxBudget,
      timeline,
      location,
      page = 1,
      limit = 20,
      sort = 'newest',
      search
    } = req.query;

    // Build filter object
    const filter = { status };
    
    if (category) filter.category = category;
    if (timeline) filter.timeline = timeline;
    if (location) filter.location = location;
    
    if (minBudget || maxBudget) {
      filter['budget.min'] = {};
      if (minBudget) filter['budget.min'].$gte = Number(minBudget);
      if (maxBudget) filter['budget.max'] = { $lte: Number(maxBudget) };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
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
      case 'budget-high':
        sortObj = { 'budget.max': -1 };
        break;
      case 'budget-low':
        sortObj = { 'budget.min': 1 };
        break;
      case 'deadline':
        sortObj = { deadline: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const issues = await Issue.find(filter)
      .populate('client', 'username profile.firstName profile.lastName profile.avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Issue.countDocuments(filter);

    res.json({
      issues,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ message: 'Server error while fetching issues' });
  }
});

// @route   GET /api/issues/:id
// @desc    Get single issue by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('client', 'username profile.firstName profile.lastName profile.avatar profile.rating')
      .populate('proposals.freelancer', 'username profile.firstName profile.lastName profile.avatar profile.rating')
      .populate('selectedProposal.freelancer', 'username profile.firstName profile.lastName profile.avatar profile.rating');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Increment view count
    issue.views += 1;
    await issue.save();

    res.json({ issue });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ message: 'Server error while fetching issue' });
  }
});

// @route   PUT /api/issues/:id
// @desc    Update issue
// @access  Private (Client only)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 10, max: 200 }),
  body('description').optional().trim().isLength({ min: 50, max: 5000 }),
  body('budget.min').optional().isNumeric(),
  body('budget.max').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user is the client
    if (issue.client.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this issue' });
    }

    // Check if issue can be updated
    if (issue.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update issue that is not open' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        issue[key] = updates[key];
      }
    });

    await issue.save();

    res.json({
      message: 'Issue updated successfully',
      issue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ message: 'Server error during issue update' });
  }
});

// @route   DELETE /api/issues/:id
// @desc    Delete issue
// @access  Private (Client only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user is the client
    if (issue.client.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    // Check if issue can be deleted
    if (issue.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete issue that is not open' });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ message: 'Server error during issue deletion' });
  }
});

// @route   POST /api/issues/:id/proposals
// @desc    Submit proposal for issue
// @access  Private (Freelancer only)
router.post('/:id/proposals', auth, [
  body('message')
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Proposal message must be between 50 and 1000 characters'),
  body('proposedBudget')
    .isNumeric()
    .withMessage('Proposed budget must be a number'),
  body('timeline')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Timeline is required and must be less than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if issue is open
    if (issue.status !== 'open') {
      return res.status(400).json({ message: 'Cannot submit proposal for closed issue' });
    }

    // Check if user is freelancer
    const user = await User.findById(req.userId);
    if (!['freelancer', 'both'].includes(user.role)) {
      return res.status(403).json({ message: 'Only freelancers can submit proposals' });
    }

    // Check if user already submitted a proposal
    const existingProposal = issue.proposals.find(
      proposal => proposal.freelancer.toString() === req.userId.toString()
    );
    if (existingProposal) {
      return res.status(400).json({ message: 'You have already submitted a proposal for this issue' });
    }

    const { message, proposedBudget, timeline, portfolio = [] } = req.body;

    // Add proposal
    await issue.addProposal(req.userId, {
      message,
      proposedBudget,
      timeline,
      portfolio
    });

    // Notify client
    await Notification.createNotification(
      issue.client,
      'new_proposal',
      'New Proposal Received',
      `You have received a new proposal for your issue: ${issue.title}`,
      { issueId: issue._id, proposalId: req.userId }
    );

    res.status(201).json({ message: 'Proposal submitted successfully' });
  } catch (error) {
    console.error('Submit proposal error:', error);
    res.status(500).json({ message: 'Server error during proposal submission' });
  }
});

// @route   POST /api/issues/:id/select-proposal
// @desc    Select a proposal
// @access  Private (Client only)
router.post('/:id/select-proposal', auth, [
  body('proposalIndex')
    .isInt({ min: 0 })
    .withMessage('Valid proposal index is required'),
  body('contract.terms')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Contract terms are required'),
  body('contract.deliverables')
    .isArray({ min: 1 })
    .withMessage('At least one deliverable is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user is the client
    if (issue.client.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to select proposal' });
    }

    // Check if issue is open
    if (issue.status !== 'open') {
      return res.status(400).json({ message: 'Cannot select proposal for closed issue' });
    }

    const { proposalIndex, contract } = req.body;

    // Check if proposal exists
    if (proposalIndex >= issue.proposals.length) {
      return res.status(400).json({ message: 'Invalid proposal index' });
    }

    // Select proposal
    await issue.selectProposal(proposalIndex, contract);

    // Notify selected freelancer
    const selectedFreelancer = issue.proposals[proposalIndex].freelancer;
    await Notification.createNotification(
      selectedFreelancer,
      'proposal_accepted',
      'Proposal Accepted',
      `Your proposal for "${issue.title}" has been accepted!`,
      { issueId: issue._id },
      { isImportant: true, priority: 'high' }
    );

    // Notify other freelancers
    const otherFreelancers = issue.proposals
      .filter((_, index) => index !== proposalIndex)
      .map(proposal => proposal.freelancer);

    for (const freelancerId of otherFreelancers) {
      await Notification.createNotification(
        freelancerId,
        'proposal_rejected',
        'Proposal Not Selected',
        `Your proposal for "${issue.title}" was not selected.`,
        { issueId: issue._id }
      );
    }

    res.json({ message: 'Proposal selected successfully' });
  } catch (error) {
    console.error('Select proposal error:', error);
    res.status(500).json({ message: 'Server error during proposal selection' });
  }
});

module.exports = router;
