const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group', 'issue'],
    default: 'direct'
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: function() {
      return this.type === 'issue';
    }
  },
  groupName: {
    type: String,
    required: function() {
      return this.type === 'group';
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  readBy: {
    type: Map,
    of: Date,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowFileSharing: { type: Boolean, default: true },
    allowVoiceMessages: { type: Boolean, default: true },
    muteNotifications: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ participants: 1, type: 1 });
chatSchema.index({ issueId: 1 });
chatSchema.index({ updatedAt: -1 });

// Virtual for unread count
chatSchema.virtual('unreadCount').get(function() {
  // This would be calculated based on lastMessage timestamp and readBy
  return 0; // Placeholder
});

// Method to add participant
chatSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
  }
  return this.save();
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(id => !id.equals(userId));
  return this.save();
};

// Method to mark as read by user
chatSchema.methods.markAsRead = function(userId) {
  if (!this.readBy) {
    this.readBy = new Map();
  }
  this.readBy.set(userId.toString(), new Date());
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
