const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// WebSocket server implementation
class WebSocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: dev ? ['http://localhost:3000', 'http://localhost:3001'] : process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.connectedUsers = new Map();
    this.recentUpdates = [];
    this.MAX_RECENT_UPDATES = 100;

    this.setupEventHandlers();
    this.startCleanupInterval();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // User authentication
      socket.on('authenticate', (userId) => {
        this.connectedUsers.set(socket.id, {
          socketId: socket.id,
          userId,
          lastActivity: Date.now()
        });
        
        // Send recent updates to newly connected user
        socket.emit('recent-updates', this.recentUpdates.slice(-20));
        
        // Notify others about user joining
        socket.broadcast.emit('user-joined', { userId, timestamp: Date.now() });
        
        console.log(`User authenticated: ${userId}`);
      });

      // Handle lesson updates
      socket.on('lesson-update', (update) => {
        this.handleLessonUpdate(socket, update);
      });

      // Handle user activity
      socket.on('user-activity', (activity) => {
        this.handleUserActivity(socket, activity);
      });

      // Handle heartbeat
      socket.on('heartbeat', () => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          user.lastActivity = Date.now();
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          console.log(`User disconnected: ${user.userId}`);
          socket.broadcast.emit('user-left', { 
            userId: user.userId, 
            timestamp: Date.now() 
          });
          this.connectedUsers.delete(socket.id);
        }
      });
    });
  }

  handleLessonUpdate(socket, update) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    // Validate update
    if (update.userId !== user.userId) {
      socket.emit('error', { message: 'Invalid user ID in update' });
      return;
    }

    // Add timestamp
    update.timestamp = Date.now();

    // Store recent update
    this.recentUpdates.push(update);
    if (this.recentUpdates.length > this.MAX_RECENT_UPDATES) {
      this.recentUpdates.shift();
    }

    // Broadcast to all other clients
    socket.broadcast.emit('lesson-updated', update);

    console.log(`Lesson update from ${user.userId}:`, update);
  }

  handleUserActivity(socket, activity) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    // Validate activity
    if (activity.userId !== user.userId) {
      socket.emit('error', { message: 'Invalid user ID in activity' });
      return;
    }

    // Add timestamp and broadcast
    activity.timestamp = Date.now();
    socket.broadcast.emit('user-activity', activity);

    // Update last activity
    user.lastActivity = Date.now();
  }

  startCleanupInterval() {
    // Clean up inactive connections every 5 minutes
    setInterval(() => {
      const now = Date.now();
      const INACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

      for (const [socketId, user] of this.connectedUsers.entries()) {
        if (now - user.lastActivity > INACTIVE_THRESHOLD) {
          console.log(`Cleaning up inactive user: ${user.userId}`);
          this.connectedUsers.delete(socketId);
        }
      }

      // Clean up old updates
      const OLD_UPDATE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
      this.recentUpdates = this.recentUpdates.filter(
        update => now - update.timestamp < OLD_UPDATE_THRESHOLD
      );
    }, 5 * 60 * 1000);
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values()).map(user => ({
      userId: user.userId,
      lastActivity: user.lastActivity
    }));
  }

  broadcastSystemMessage(message, data) {
    this.io.emit('system-message', { message, data, timestamp: Date.now() });
  }

  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      recentUpdates: this.recentUpdates.length,
      uptime: process.uptime()
    };
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket server
  const wsServer = new WebSocketServer(server);
  
  // Store WebSocket server globally for API access
  global.wsServer = wsServer;

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server initialized`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});