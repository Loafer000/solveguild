const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
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
      'general'
    ]
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: { type: Date, default: Date.now },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  settings: {
    isPublic: { type: Boolean, default: true },
    allowMemberInvites: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 1000 }
  },
  tags: [String],
  avatar: String,
  coverImage: String,
  rules: [String],
  posts: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    attachments: [{
      filename: String,
      url: String,
      type: String
    }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  memberCount: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes
groupSchema.index({ category: 1, isActive: 1 });
groupSchema.index({ creator: 1 });
groupSchema.index({ 'members.user': 1 });

// Virtual for member count
groupSchema.virtual('totalMembers').get(function() {
  return this.members.length;
});

// Method to add member
groupSchema.methods.addMember = function(userId, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member');
  }
  
  // Check member limit
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Group has reached maximum member limit');
  }
  
  this.members.push({
    user: userId,
    role
  });
  
  this.memberCount = this.members.length;
  return this.save();
};

// Method to remove member
groupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    !member.user.equals(userId)
  );
  
  this.memberCount = this.members.length;
  return this.save();
};

// Method to update member role
groupSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (member) {
    member.role = newRole;
    return this.save();
  }
  
  throw new Error('Member not found');
};

// Method to add post
groupSchema.methods.addPost = function(authorId, content, attachments = []) {
  this.posts.push({
    author: authorId,
    content,
    attachments
  });
  return this.save();
};

// Method to like post
groupSchema.methods.likePost = function(postIndex, userId) {
  const post = this.posts[postIndex];
  if (!post) throw new Error('Post not found');
  
  const likeIndex = post.likes.findIndex(like => like.toString() === userId.toString());
  
  if (likeIndex === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(likeIndex, 1);
  }
  
  return this.save();
};

// Method to add comment
groupSchema.methods.addComment = function(postIndex, authorId, content) {
  const post = this.posts[postIndex];
  if (!post) throw new Error('Post not found');
  
  post.comments.push({
    author: authorId,
    content
  });
  
  return this.save();
};

module.exports = mongoose.model('Group', groupSchema);
