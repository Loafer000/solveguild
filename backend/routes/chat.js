const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat/conversations
// @desc    Get user's chat conversations
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Chat.find({
      participants: req.userId
    })
    .populate('participants', 'username profile.firstName profile.lastName profile.avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error while fetching conversations' });
  }
});

// @route   POST /api/chat/conversations
// @desc    Create new conversation
// @access  Private
router.post('/conversations', auth, [
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.*')
    .isMongoId()
    .withMessage('Invalid participant ID'),
  body('type')
    .optional()
    .isIn(['direct', 'group', 'issue'])
    .withMessage('Invalid chat type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participants, type = 'direct', issueId, groupName } = req.body;

    // Add current user to participants
    const allParticipants = [...new Set([req.userId, ...participants])];

    // Check if conversation already exists
    const existingChat = await Chat.findOne({
      participants: { $all: allParticipants },
      type
    });

    if (existingChat) {
      return res.json({ 
        message: 'Conversation already exists',
        chat: existingChat 
      });
    }

    const chat = new Chat({
      participants: allParticipants,
      type,
      issueId,
      groupName,
      createdBy: req.userId
    });

    await chat.save();
    await chat.populate('participants', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      message: 'Conversation created successfully',
      chat
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error during conversation creation' });
  }
});

// @route   GET /api/chat/conversations/:chatId
// @desc    Get specific conversation
// @access  Private
router.get('/conversations/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'username profile.firstName profile.lastName profile.avatar')
      .populate('issueId', 'title category');

    if (!chat) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      participant => participant._id.toString() === req.userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error while fetching conversation' });
  }
});

// @route   GET /api/chat/conversations/:chatId/messages
// @desc    Get messages for a conversation
// @access  Private
router.get('/conversations/:chatId/messages', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 50 } = req.query;

    // Check if user has access to this conversation
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access this conversation' });
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('sender', 'username profile.firstName profile.lastName profile.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ chatId: req.params.chatId });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
});

// @route   POST /api/chat/conversations/:chatId/messages
// @desc    Send message to conversation
// @access  Private
router.post('/conversations/:chatId/messages', auth, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'file', 'system'])
    .withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, type = 'text', attachments = [] } = req.body;

    // Check if user has access to this conversation
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to send messages to this conversation' });
    }

    // Create message
    const message = new Message({
      chatId: req.params.chatId,
      sender: req.userId,
      content,
      type,
      attachments
    });

    await message.save();
    await message.populate('sender', 'username profile.firstName profile.lastName profile.avatar');

    // Update chat's last message and timestamp
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Emit message to all participants via Socket.io
    // This would be handled in the Socket.io connection handler
    // io.to(chatId).emit('new-message', message);

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error during message sending' });
  }
});

// @route   PUT /api/chat/conversations/:chatId/messages/:messageId
// @desc    Edit message
// @access  Private
router.put('/conversations/:chatId/messages/:messageId', auth, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    // Check if message is not too old (e.g., 24 hours)
    const messageAge = Date.now() - message.createdAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (messageAge > maxAge) {
      return res.status(400).json({ message: 'Message is too old to edit' });
    }

    message.content = content;
    message.editedAt = new Date();
    await message.save();

    res.json({
      message: 'Message updated successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error during message editing' });
  }
});

// @route   DELETE /api/chat/conversations/:chatId/messages/:messageId
// @desc    Delete message
// @access  Private
router.delete('/conversations/:chatId/messages/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    // Check if message is not too old (e.g., 1 hour)
    const messageAge = Date.now() - message.createdAt.getTime();
    const maxAge = 60 * 60 * 1000; // 1 hour

    if (messageAge > maxAge) {
      return res.status(400).json({ message: 'Message is too old to delete' });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error during message deletion' });
  }
});

// @route   POST /api/chat/conversations/:chatId/read
// @desc    Mark conversation as read
// @access  Private
router.post('/conversations/:chatId/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      participant => participant.toString() === req.userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to mark this conversation as read' });
    }

    // Update read status for user
    if (!chat.readBy) {
      chat.readBy = {};
    }
    chat.readBy[req.userId] = new Date();
    await chat.save();

    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error during marking as read' });
  }
});

module.exports = router;
