/**
 * Socket.IO Service
 * Manages real-time websocket connections and event handling
 */

let ioInstance = null;
const connectedUsers = new Map(); // socketId -> userId mapping

/**
 * Initialize Socket.IO service with io instance
 */
function initializeSocket(io) {
  ioInstance = io;
  console.log('[Socket] Initializing Socket.IO service...');

  // Handle new connections
  ioInstance.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Handle user identification
    socket.on('user:identify', (data) => {
      const userId = data.userId;
      connectedUsers.set(socket.id, userId);
      console.log(`[Socket] User identified: ${userId} (socket: ${socket.id})`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userId = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);
      console.log(`[Socket] Client disconnected: ${socket.id}${userId ? ` (user: ${userId})` : ''}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[Socket] Error on ${socket.id}:`, error);
    });
  });
}

/**
 * Broadcast notification to all connected clients
 */
function broadcastNotification(notification) {
  if (!ioInstance) {
    console.warn('[Socket] Socket.IO not initialized');
    return;
  }

  ioInstance.emit('schedule:notification', {
    type: notification.type,
    title: notification.title || 'Notification',
    message: notification.message,
    scheduleName: notification.scheduleName,
    timestamp: new Date(),
  });

  console.log(`[Socket] Broadcast notification: ${notification.title}`);
}

/**
 * Send notification to specific user
 */
function sendNotificationToUser(userId, notification) {
  if (!ioInstance) {
    console.warn('[Socket] Socket.IO not initialized');
    return;
  }

  let socketId = null;
  for (const [sid, uid] of connectedUsers.entries()) {
    if (uid === userId) {
      socketId = sid;
      break;
    }
  }

  if (!socketId) {
    console.warn(`[Socket] User ${userId} not connected`);
    return;
  }

  ioInstance.to(socketId).emit('schedule:notification', {
    type: notification.type,
    title: notification.title || 'Notification',
    message: notification.message,
    scheduleName: notification.scheduleName,
    timestamp: new Date(),
  });

  console.log(`[Socket] Sent notification to user ${userId}`);
}

/**
 * Get list of connected users
 */
function getConnectedUsers() {
  return Array.from(connectedUsers.values());
}

/**
 * Get connection count
 */
function getConnectionCount() {
  return connectedUsers.size;
}

module.exports = {
  initializeSocket,
  broadcastNotification,
  sendNotificationToUser,
  getConnectedUsers,
  getConnectionCount,
};
