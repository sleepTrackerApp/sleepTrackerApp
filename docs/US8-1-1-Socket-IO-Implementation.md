# US8-1-1: Socket.IO Library Configuration with Message Functionality and Storage Model

## Overview
Complete Socket.IO implementation for real-time messaging with persistent storage, supporting user-to-user messages, notifications, and system messages.

## Completed Components

### 1. Socket.IO Service Layer
**File:** `src/services/socketService.js`

- `initializeSocket(io)` - Initialize Socket.IO with connection handlers
- `broadcastNotification(notification)` - Send message to all connected clients
- `sendNotificationToUser(userId, notification)` - Send message to specific user
- `getConnectedUsers()` - Get list of active users
- `getConnectionCount()` - Get number of connected users

**Features:**
- User identification and tracking
- Connection/disconnection handling
- Error handling for socket events

### 2. Message Storage Model
**File:** `src/models/Message.js`

Schema fields:
- `senderId` (ObjectId, required) - Reference to User sending message
- `recipientId` (ObjectId, optional) - Reference to User receiving message
- `content` (String, required) - Message text content
- `messageType` (String, enum) - 'text', 'notification', or 'system'
- `isRead` (Boolean, default: false) - Read status
- `readAt` (Date, optional) - Timestamp when message was read
- `metadata` (Object) - Extensible metadata for future features
- `createdAt` (Timestamp) - Auto-created timestamp
- `updatedAt` (Timestamp) - Auto-updated timestamp

### 3. Socket Events Implementation
**File:** `src/server.js`

**Client → Server Events:**
- `user:register` - Register user socket connection
- `message:send` - Send message to recipient or support bot
- `message:read` - Mark message as read

**Server → Client Events:**
- `user:registered` - Confirm user registration with socket ID
- `message:received` - New message arrival
- `message:read` - Message read receipt
- `schedule:notification` - Bedtime reminder notification
- `message:error` - Error notification

### 4. Server Integration
**File:** `src/server.js`

- Socket.IO server initialization with CORS enabled
- User registration and socket mapping
- Message persistence to MongoDB
- Read receipt handling
- Bot reply generation for support messages

### 5. Scheduler Integration
**File:** `src/helpers/scheduler.js`

- Uses `socketService.broadcastNotification()` for bedtime reminders
- Triggers notifications via Socket.IO in real-time
- Integrates with schedule cron jobs

## Event Flow Diagram

```
Client Browser
    ↓
[Socket.IO Connection]
    ↓
user:register event
    ↓
Socket Service tracks user
    ↓
Message sent (message:send)
    ↓
Server validates and stores in MongoDB
    ↓
Server emits message:received
    ↓
Client displays message
```

## Usage Examples

### Broadcasting Bedtime Notification
```javascript
socketService.broadcastNotification({
  type: 'bedtime',
  title: 'Bedtime Reminder',
  message: 'It\'s time for bed!',
  scheduleName: 'Evening Schedule'
});
```

### Sending User-Specific Message
```javascript
socketService.sendNotificationToUser(userId, {
  type: 'notification',
  title: 'New Message',
  message: 'You have a new message'
});
```

### Getting Connection Stats
```javascript
const connectedUsers = socketService.getConnectedUsers();
const connectionCount = socketService.getConnectionCount();
```

## Message Storage
All messages are persisted to MongoDB:
- User-to-user messages
- Notifications
- System messages
- Read receipts with timestamps

## Real-Time Features
✅ Instant message delivery  
✅ Read receipt notifications  
✅ User presence tracking  
✅ Support bot integration  
✅ Bedtime notifications  
✅ Connection state management  

## Testing
- Use `/diagnostics/test-notification` endpoint for testing notifications
- Messages are stored in MongoDB and queryable via Message model
- Socket connections visible in server logs

## Future Enhancements
- Group messaging support
- Message typing indicators
- Message reactions/emojis
- File attachments
- Message search functionality
- Message encryption
