/**
 * Alive Sleep Tracker Application
 * Entry point for the server.
 */
const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./app');
const { connectDb } = require('./helpers/db');
const { appConfig } = require('./helpers/settings');
const { startScheduler, setSocketIO } = require('./helpers/scheduler');
const { Message, User } = require('./models');
const socketService = require('./services/socketService');

const { PORT, MONGODB_URI } = appConfig;

/**
 * Initializes Socket.IO with the HTTP server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
function initializeSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Store active user socket connections (userId/username -> socket.id)
  const userSockets = new Map();
  // Store socket to user mapping (socket.id -> user object with _id and username)
  const socketUsers = new Map();

  // Expose maps for HTTP handlers
  io.locals = { userSockets, socketUsers };

  // Simple support bot reply generator
  function buildBotReply(message) {
    if (!message || typeof message !== 'string') return 'Thanks for reaching out! How can I assist?';
    const lower = message.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) return 'Hi there! How can I help you today?';
    if (lower.includes('sleep')) return 'Tip: Try a consistent bedtime and reduce screen time 30 minutes before sleep.';
    if (lower.includes('schedule')) return 'You can adjust your schedule from the Dashboard > Schedules page.';
    if (lower.includes('help')) return 'Sure—describe the issue and I’ll guide you.';
    return 'Got it! I will pass this on. Meanwhile, you can check the Insights and Dashboard for more details.';
  }

  // Socket connection handler
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Register user socket connection
    socket.on('user:register', async (userId) => {
      try {
        // For testing: create or find a test user with this username
        let user = await User.findOne({ testUsername: userId });
        
        if (!user) {
          // Create a new test user
          user = await User.create({
            authIdHash: `test_${userId}_${Date.now()}`,
            testUsername: userId,
          });
          console.log(`Created new test user: ${userId} (ID: ${user._id})`);
        }

        // Store mappings
        userSockets.set(userId, socket.id);
        socketUsers.set(socket.id, {
          _id: user._id,
          username: userId,
        });

        socket.userId = userId;
        socket.userObjectId = user._id;

        console.log(`User ${userId} registered with socket ${socket.id}`);
        socket.emit('user:registered', {
          userId,
          socketId: socket.id,
          userObjectId: user._id.toString(),
        });
      } catch (error) {
        console.error('Error registering user:', error);
        socket.emit('user:error', { error: error.message });
      }
    });

    // Handle incoming message
    socket.on('message:send', async (messageData) => {
      try {
        const { content, recipientId, messageType = 'text' } = messageData;
        const senderUsername = socket.userId;
        const senderObjectId = socket.userObjectId;
        const isBotRecipient = typeof recipientId === 'string' && recipientId.toLowerCase() === 'support-bot';

        if (!senderObjectId) {
          socket.emit('message:error', { error: 'User not registered. Please register first.' });
          return;
        }

        // Find recipient user (bot or human)
        let recipientUser = await User.findOne({ testUsername: recipientId });
        if (!recipientUser) {
          // Create recipient user if doesn't exist
          recipientUser = await User.create({
            authIdHash: `test_${recipientId}_${Date.now()}`,
            testUsername: recipientId,
          });
        }

        // Persist message to database
        const message = await Message.create({
          senderId: senderObjectId,
          recipientId: recipientUser._id,
          content,
          messageType,
          isRead: false,
        });

        console.log(`Message saved: ${message._id} from ${senderUsername} to ${recipientId}`);

        // Emit to recipient if online
        const recipientSocketId = userSockets.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message:receive', {
            _id: message._id,
            senderId: senderObjectId,
            senderUsername,
            content,
            messageType,
            createdAt: message.createdAt,
          });
          console.log(`Message delivered to recipient: ${recipientId}`);
        } else {
          console.log(`Recipient ${recipientId} offline, message stored for later delivery`);
        }

        // Acknowledge to sender
        socket.emit('message:sent', {
          _id: message._id,
          status: 'delivered',
          timestamp: message.createdAt,
        });

        // Auto-reply from support bot
        if (isBotRecipient) {
          const botReply = buildBotReply(content);
          const botMessage = await Message.create({
            senderId: recipientUser._id,
            recipientId: senderObjectId,
            content: botReply,
            messageType: 'system',
            isRead: false,
          });

          io.to(socket.id).emit('message:receive', {
            _id: botMessage._id,
            senderId: recipientUser._id,
            senderUsername: 'support-bot',
            content: botReply,
            messageType: 'system',
            createdAt: botMessage.createdAt,
          });

          console.log('Bot replied to', senderUsername);
        }
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('message:error', { error: error.message });
      }
    });

    // Handle message read receipt
    socket.on('message:read', async (messageId) => {
      try {
        const message = await Message.findByIdAndUpdate(
            messageId,
            {
              isRead: true,
              readAt: new Date(),
            },
            { new: true }
        );

        if (message) {
          // Notify sender of read receipt
          const senderSocketId = userSockets.get(message.senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('message:read', {
              messageId,
              readAt: message.readAt,
            });
          }
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
        socketUsers.delete(socket.id);
        console.log(`User ${socket.userId} disconnected`);
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Initialize Socket service for notifications
  socketService.initializeSocket(io);

  return io;
}

/**
 * Connects to the database and starts the Express server with Socket.IO.
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDb(MONGODB_URI);

    // Create Express app first
    const app = createApp();

    // Create HTTP server with Express app
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = initializeSocketIO(server);
    console.log('Socket.IO initialized successfully');

    // Pass Socket.IO instance to scheduler for notifications
    setSocketIO(io);

    // Attach io instance to app for diagnostic routes
    app.set('io', io);
    app.set('server', server);

    // Start listening on the specified port
    server.listen(PORT, () => {
      console.log(`Alive Sleep Tracker App server listening on http://localhost:${PORT}`);
    });

    // Start scheduler after server is up
    void startScheduler();

    // Provide a clearer message if the port is already in use
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Set a free PORT in your .env or stop the other process.`);
        process.exit(1);
      }
      throw err;
    });
  } catch (error) {
    // Handle errors during startup
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}


// Start the server
void startServer();

