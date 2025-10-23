const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  author: {
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
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'programming',
      'web-development',
      'mobile-development',
      'data-science',
      'ai-ml',
      'cybersecurity',
      'blockchain',
      'game-development',
      'ui-ux-design',
      'devops',
      'database',
      'cloud-computing',
      'networking',
      'hardware',
      'other'
    ]
  },
  tags: [String],
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number
  }],
  media: [{
    type: String,
    enum: ['image', 'video', 'audio', 'document'],
    url: String,
    thumbnail: String
  }],
  answers: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    attachments: [{
      filename: String,
      url: String,
      type: String,
      size: Number
    }],
    isAccepted: { type: Boolean, default: false },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  isResolved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  bounty: {
    amount: Number,
    currency: { type: String, default: 'USD' },
    isActive: { type: Boolean, default: false }
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
doubtSchema.index({ category: 1, isResolved: 1, createdAt: -1 });
doubtSchema.index({ author: 1, createdAt: -1 });
doubtSchema.index({ tags: 1 });
doubtSchema.index({ upvotes: -1, createdAt: -1 });

// Virtual for answer count
doubtSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});

// Virtual for vote score
doubtSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Method to add answer
doubtSchema.methods.addAnswer = function(authorId, content, attachments = []) {
  this.answers.push({
    author: authorId,
    content,
    attachments
  });
  return this.save();
};

// Method to accept answer
doubtSchema.methods.acceptAnswer = function(answerIndex) {
  // Unaccept all other answers
  this.answers.forEach(answer => {
    answer.isAccepted = false;
  });
  
  // Accept the selected answer
  if (this.answers[answerIndex]) {
    this.answers[answerIndex].isAccepted = true;
    this.isResolved = true;
  }
  
  return this.save();
};

// Method to vote on doubt
doubtSchema.methods.vote = function(userId, voteType) {
  // Remove existing votes
  this.upvotes = this.upvotes.filter(id => !id.equals(userId));
  this.downvotes = this.downvotes.filter(id => !id.equals(userId));
  
  // Add new vote
  if (voteType === 'upvote') {
    this.upvotes.push(userId);
  } else if (voteType === 'downvote') {
    this.downvotes.push(userId);
  }
  
  return this.save();
};

// Method to vote on answer
doubtSchema.methods.voteAnswer = function(answerIndex, userId, voteType) {
  const answer = this.answers[answerIndex];
  if (!answer) throw new Error('Answer not found');
  
  // Remove existing votes
  answer.upvotes = answer.upvotes.filter(id => !id.equals(userId));
  answer.downvotes = answer.downvotes.filter(id => !id.equals(userId));
  
  // Add new vote
  if (voteType === 'upvote') {
    answer.upvotes.push(userId);
  } else if (voteType === 'downvote') {
    answer.downvotes.push(userId);
  }
  
  return this.save();
};

module.exports = mongoose.model('Doubt', doubtSchema);
