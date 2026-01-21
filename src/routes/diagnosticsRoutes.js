const express = require('express');

const router = express.Router();

/**
 * GET /diagnostics/sockets
 * Returns information about active Socket.IO connections
 */
router.get('/sockets', (req, res) => {
  try {
    const server = req.app.get('server');
    
    if (!server) {
      return res.status(503).json({
        status: 'error',
        message: 'Socket.IO not initialized',
      });
    }

    const io = req.app.get('io');
    if (!io) {
      return res.status(503).json({
        status: 'error',
        message: 'Socket.IO instance not available',
      });
    }

    const sockets = io.sockets.sockets;
    const socketList = [];
    const userMap = {};

    sockets.forEach((socket) => {
      socketList.push({
        socketId: socket.id,
        userId: socket.userId || 'anonymous',
        connectedAt: socket.handshake.issued,
        ip: socket.handshake.address,
      });

      if (socket.userId) {
        userMap[socket.userId] = socket.id;
      }
    });

    return res.json({
      status: 'success',
      totalConnections: sockets.size,
      activeUsers: Object.keys(userMap).length,
      sockets: socketList,
      userMap,
    });
  } catch (error) {
    console.error('Error retrieving socket information:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * GET /diagnostics/socket/:socketId
 * Returns detailed information about a specific socket
 */
router.get('/socket/:socketId', (req, res) => {
  try {
    const { socketId } = req.params;
    const io = req.app.get('io');

    if (!io) {
      return res.status(503).json({
        status: 'error',
        message: 'Socket.IO instance not available',
      });
    }

    const socket = io.sockets.sockets.get(socketId);

    if (!socket) {
      return res.status(404).json({
        status: 'error',
        message: `Socket ${socketId} not found`,
      });
    }

    return res.json({
      status: 'success',
      socketId: socket.id,
      userId: socket.userId || 'anonymous',
      connectedAt: socket.handshake.issued,
      ip: socket.handshake.address,
      rooms: Array.from(socket.rooms),
      headers: socket.handshake.headers,
    });
  } catch (error) {
    console.error('Error retrieving socket information:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;
