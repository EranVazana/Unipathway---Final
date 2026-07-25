const Notification           = require('../models/Notification');
const UserNotificationStatus = require('../models/UserNotificationStatus');

let _io = null;

function init(httpServer) {
  const { Server } = require('socket.io');
  _io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  _io.on('connection', (socket) => {
    // Event 1: presence:join — client identifies itself
    socket.on('presence:join', ({ userId, role }) => {
      socket.data.userId = userId;
      socket.data.role   = role;
      console.log(`[WS] Connected: user ${userId} (${role})`);
    });

    // Event 2: notification:read — mark one as read
    socket.on('notification:read', async ({ notificationId }) => {
      const userId = socket.data.userId;
      if (userId) await UserNotificationStatus.markRead(userId, notificationId);
      socket.emit('notification:read_ack', { notificationId });
    });

    // Event 3: notification:read_all — mark all as read
    socket.on('notification:read_all', async () => {
      const userId = socket.data.userId;
      if (userId) await UserNotificationStatus.markAllRead(userId);
      socket.emit('notification:read_all_ack');
    });

    // Event 4: notification:clear — client-side only clear (does not delete from DB)
    socket.on('notification:clear', () => {
      socket.emit('notification:clear_ack');
    });

    socket.on('disconnect', () => {
      const who = socket.data.userId ? `user ${socket.data.userId}` : socket.id;
      console.log(`[WS] Client disconnected: ${who}`);
    });
  });

  return _io;
}

function getIO() {
  if (!_io) throw new Error('Socket.IO not initialized.');
  return _io;
}

// Event 5: notification:new — save to DB then broadcast, skipping the user who triggered it
async function broadcast(notificationData, excludeUserId = null) {
  if (!_io) return;
  try {
    const notificationId = await Notification.create(notificationData);
    await UserNotificationStatus.createForAllUsers(notificationId, excludeUserId);

    const payload = { ...notificationData, id: notificationId, read: false };

    // Emit to all sockets except the one belonging to the triggering user
    _io.sockets.sockets.forEach(socket => {
      if (socket.data.userId !== excludeUserId) {
        socket.emit('notification:new', payload);
      }
    });
  } catch (err) {
    console.error('[WS] broadcast error:', err.message);
  }
}

module.exports = { init, getIO, broadcast };