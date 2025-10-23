const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'logo-design',
      'video-editing',
      'app-development',
      'web-development',
      'ai-ml',
      'data-science',
      'cybersecurity',
      'blockchain',
      'game-development',
      'ui-ux-design',
      'digital-marketing',
      'content-writing',
      'translation',
      'voice-over',
      'photography',
      'other'
    ]
  },
  budget: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    isNegotiable: { type: Boolean, default: true }
  },
  timeline: {
    type: String,
    enum: ['urgent', '1-week', '2-weeks', '1-month', '2-months', '3-months', 'flexible'],
    required: true
  },
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number
  }],
  requirements: [String],
  skills: [String],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled', 'disputed'],
    default: 'open'
  },
  visibility: {
    type: String,
    enum: ['public', 'premium-only'],
    default: 'public'
  },
  proposals: [{
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    proposedBudget: Number,
    timeline: String,
    portfolio: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  selectedProposal: {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    selectedAt: Date,
    contract: {
      terms: String,
      deliverables: [String],
      milestones: [{
        name: String,
        description: String,
        dueDate: Date,
        amount: Number,
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
      }]
    }
  },
  tags: [String],
  views: { type: Number, default: 0 },
  isUrgent: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  deadline: Date,
  location: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    default: 'remote'
  },
  clientRating: {
    rating: Number,
    review: String,
    ratedAt: Date
  },
  freelancerRating: {
    rating: Number,
    review: String,
    ratedAt: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
issueSchema.index({ category: 1, status: 1, createdAt: -1 });
issueSchema.index({ client: 1, status: 1 });
issueSchema.index({ 'proposals.freelancer': 1 });

// Virtual for proposal count
issueSchema.virtual('proposalCount').get(function() {
  return this.proposals.length;
});

// Method to add proposal
issueSchema.methods.addProposal = function(freelancerId, proposalData) {
  this.proposals.push({
    freelancer: freelancerId,
    ...proposalData
  });
  return this.save();
};

// Method to select proposal
issueSchema.methods.selectProposal = function(proposalIndex, contractData) {
  const proposal = this.proposals[proposalIndex];
  if (!proposal) throw new Error('Proposal not found');
  
  this.selectedProposal = {
    freelancer: proposal.freelancer,
    selectedAt: new Date(),
    contract: contractData
  };
  this.status = 'in-progress';
  return this.save();
};

module.exports = mongoose.model('Issue', issueSchema);
