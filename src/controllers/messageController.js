const { Message, User } = require('../models');

/**
 * Render messages page
 */
async function renderMessages(req, res) {
  try {
    const userIdHash = req.oidc?.user?.sub;
    console.log('Messages route accessed. User sub:', userIdHash);
    
    if (!userIdHash) {
      console.log('No user found, redirecting to login');
      return res.redirect('/auth/login');
    }

    // Get user from database
    let user = await User.findOne({ authIdHash: userIdHash });
    if (!user) {
      // Create user if doesn't exist
      console.log('Creating new user for:', userIdHash);
      user = await User.create({
        authIdHash: userIdHash,
      });
    }

    console.log('User found/created:', user._id);

    // Get all messages for this user (sent or received)
    const messages = await Message.find({
      $or: [
        { senderId: user._id },
        { recipientId: user._id }
      ]
    })
        .populate('senderId', 'testUsername')
        .populate('recipientId', 'testUsername')
        .sort({ createdAt: -1 })
        .limit(100);

    // Get unique conversations
    const conversationMap = new Map();
    messages.forEach(msg => {
      const otherUserId = msg.senderId._id.toString() === user._id.toString()
          ? msg.recipientId._id.toString()
          : msg.senderId._id.toString();

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          username: msg.senderId._id.toString() === user._id.toString()
              ? msg.recipientId.testUsername
              : msg.senderId.testUsername,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unread: msg.recipientId._id.toString() === user._id.toString() && !msg.isRead
        });
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.render('pages/messages', {
      user,
      conversations,
      messages
    });
  } catch (error) {
    console.error('Error rendering messages:', error);
    res.status(500).send('Error loading messages: ' + error.message);
  }
}

/**
 * Get messages with a specific user
 */
async function getConversation(req, res) {
  try {
    const userIdHash = req.oidc?.user?.sub;
    const { otherUserId } = req.params;

    if (!userIdHash) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let user = await User.findOne({ authIdHash: userIdHash });
    if (!user) {
      user = await User.create({
        authIdHash: userIdHash,
      });
    }

    // Get conversation messages
    const messages = await Message.find({
      $or: [
        { senderId: user._id, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: user._id }
      ]
    })
        .populate('senderId', 'testUsername')
        .populate('recipientId', 'testUsername')
        .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
        {
          senderId: otherUserId,
          recipientId: user._id,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
    );

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get unread message count
 */
async function getUnreadCount(req, res) {
  try {
    const userIdHash = req.oidc?.user?.sub;
    if (!userIdHash) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let user = await User.findOne({ authIdHash: userIdHash });
    if (!user) {
      user = await User.create({
        authIdHash: userIdHash,
      });
    }

    const unreadCount = await Message.countDocuments({
      recipientId: user._id,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  renderMessages,
  getConversation,
  getUnreadCount
};
