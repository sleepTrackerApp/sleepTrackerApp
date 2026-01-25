/**
 * Socket helper: sets up Socket.IO, manages rooms by userId, delivers real-time
 * messages to a given userId. The handshake request is run through the same
 * auth + userSync pipeline as the app so the user is resolved from the session.
 *
 * Supported message types:
 *  - text (system announcement)
 *  - message (user to chatbot)
 *  - reply (chatbot to user)
 */
const http = require('http');
const { Server } = require('socket.io');
const { appConfig } = require('./settings');
const { createAuthMiddleware, userSyncMiddleware } = require('./auth');

let io = null;

const authMiddleware = createAuthMiddleware();

/**
 * Initialize Socket.IO. Runs the handshake through auth + userSync only (not the
 * full app) so the pipeline completes and our callback runs with res.locals.userRecord.
 * @param {import('http').Server} server - HTTP server instance
 * @param {import('express').Express} app - Express app (unused; we run auth pipeline directly)
 * @returns {import('socket.io').Server} Socket.IO server instance
 */
function initialize(server, app) {
  io = new Server(server, {
    cors: {
      origin: appConfig.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const req = socket.request;
    const hasCookie = Boolean(req.headers && req.headers.cookie);
    console.log('[Socket] handshake attempt', { hasCookie, url: req.url });
    if (typeof req.get !== 'function') {
      req.get = function (name) {
        return name ? (this.headers && this.headers[name.toLowerCase()]) : undefined;
      };
    }
    const res = new http.ServerResponse(req);
    res.locals = {};
    authMiddleware(req, res, (err) => {
      if (err) {
        console.log('[Socket] handshake auth error', err.message || err);
        return next(err);
      }
      userSyncMiddleware(req, res, (err2) => {
        if (err2) {
          console.log('[Socket] handshake userSync error', err2.message || err2);
          return next(err2);
        }
        const user = res.locals?.userRecord;
        if (!user || !user._id) {
          console.log('[Socket] handshake rejected: no userRecord', {
            hasUser: Boolean(user),
            hasId: user ? Boolean(user._id) : false,
          });
          return next(new Error('Unauthorized'));
        }
        socket.userId = String(user._id);
        console.log('[Socket] handshake ok', { userId: socket.userId });
        next();
      });
    });
  });

  io.on('connection', (socket) => {
    const uid = String(socket.userId);
    socket.join(uid);
    console.log('[Socket] connection', { socketId: socket.id, userId: uid });
  });

  return io;
}

/**
 * Deliver a message to a clients's room. Optional event separates channels (e.g. announcements vs chat vs schedule).
 * @param {string|import('mongoose').Types.ObjectId} userId - Room id (user id string)
 * @param {object} data - Payload to send
 * @param {string} [event='message:text'] - Socket event name. Use:
 *  - 'message:text' (default) for announcements,
 *  - 'chat:message' for user messages,
 *  - 'chat:reply' for bot replies,
 *  - 'schedule:notification' for schedule alerts, etc.
 */
function deliver(userId, data, event = 'message:text') {
  if (!io) return;
  const uid = String(userId);
  console.log('[Socket] deliver', { event, userId: uid, messageId: data.messageId });
  io.to(uid).emit(event, data);
}

/**
 * Broadcast a message to all connected clients.
 * @param {object} data - Payload to send
 * @param {string} event - Socket event name
 */
function broadcast(data, event = 'message:text') {
  if (!io) return;
  io.emit(event, data);
}

module.exports = { initialize, deliver, broadcast };
