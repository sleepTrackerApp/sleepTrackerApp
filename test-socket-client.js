/**
 * Socket.IO Client Test
 * Connects to Socket.IO server and tests messaging
 */

const io = require('socket.io-client');

// Connect to server
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Connection events
socket.on('connect', () => {
  console.log('\n✅ Socket Connected!');
  console.log(`   Socket ID: ${socket.id}\n`);

  // Register user
  const userId = 'testUser123';
  socket.emit('user:register', userId);
  console.log(`📝 Registered user: ${userId}\n`);

  // Send test message
  setTimeout(() => {
    const messageData = {
      content: 'Hello from Socket.IO test client!',
      recipientId: 'someOtherUser',
      messageType: 'text',
    };

    console.log('📤 Sending test message...');
    console.log(`   Content: "${messageData.content}"`);
    console.log(`   Recipient: ${messageData.recipientId}\n`);

    socket.emit('message:send', messageData);
  }, 500);

  // Listen for message events
  socket.on('message:sent', (data) => {
    console.log('✅ Message Sent Confirmation:');
    console.log(`   Message ID: ${data._id}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Timestamp: ${data.timestamp}\n`);
  });

  socket.on('message:error', (error) => {
    console.log('❌ Message Error:', error);
  });

  // Disconnect after 3 seconds to test logs
  setTimeout(() => {
    console.log('🔌 Closing connection...\n');
    socket.disconnect();
    process.exit(0);
  }, 3000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection Error:', error.message);
});

socket.on('disconnect', () => {
  console.log('🔌 Socket Disconnected\n');
});

socket.on('error', (error) => {
  console.error('❌ Socket Error:', error);
});

// Log all events for debugging
socket.onAny((eventName, ...args) => {
  if (!['connect', 'disconnect'].includes(eventName)) {
    console.log(`📡 Event received: ${eventName}`, args);
  }
});

console.log('🚀 Socket.IO Client Test Started');
console.log('   Connecting to http://localhost:3000\n');
