const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'new_proposal',
      'proposal_accepted',
      'proposal_rejected',
      'new_message',
      'issue_assigned',
      'issue_completed',
      'new_doubt_answer',
      'doubt_resolved',
      'group_invite',
      'group_post',
      'premium_expiring',
      'badge_earned',
      'rating_received',
      'system_announcement'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    // Flexible data object for different notification types
    issueId: mongoose.Schema.Types.ObjectId,
    proposalId: mongoose.Schema.Types.ObjectId,
    doubtId: mongoose.Schema.Types.ObjectId,
    groupId: mongoose.Schema.Types.ObjectId,
    chatId: mongoose.Schema.Types.ObjectId,
    badgeName: String,
    rating: Number,
    amount: Number,
    currency: String
  },
  isRead: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: String,
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = function(userId, type, title, message, data = {}, options = {}) {
  return this.create({
    user: userId,
    type,
    title,
    message,
    data,
    isImportant: options.isImportant || false,
    priority: options.priority || 'medium',
    actionUrl: options.actionUrl,
    expiresAt: options.expiresAt
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, isRead: false });
};

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
