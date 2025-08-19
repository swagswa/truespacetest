import { Server } from 'socket.io';
import { createServer } from 'http';

export interface LessonUpdate {
  lessonId: string;
  userId: string;
  type: 'favorite' | 'completed';
  action: 'add' | 'remove';
  timestamp: number;
}

export interface UserActivity {
  userId: string;
  action: string;
  lessonId?: string;
  timestamp: number;
}

class WebSocketServer {
  private io: Server;
  private connectedUsers = new Map<string, { socketId: string; userId: string; lastActivity: number }>();
  private recentUpdates: LessonUpdate[] = [];
  private readonly MAX_RECENT_UPDATES = 100;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.FRONTEND_URL 
          : ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    this.startCleanupInterval();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // User authentication
      socket.on('authenticate', (userId: string) => {
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
      socket.on('lesson-update', (update: LessonUpdate) => {
        this.handleLessonUpdate(socket, update);
      });

      // Handle user activity
      socket.on('user-activity', (activity: UserActivity) => {
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

  private handleLessonUpdate(socket: any, update: LessonUpdate) {
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

  private handleUserActivity(socket: any, activity: UserActivity) {
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

  private startCleanupInterval() {
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

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get connected users
  getConnectedUsers(): Array<{ userId: string; lastActivity: number }> {
    return Array.from(this.connectedUsers.values()).map(user => ({
      userId: user.userId,
      lastActivity: user.lastActivity
    }));
  }

  // Broadcast system message
  broadcastSystemMessage(message: string, data?: any) {
    this.io.emit('system-message', { message, data, timestamp: Date.now() });
  }

  // Get server stats
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      recentUpdates: this.recentUpdates.length,
      uptime: process.uptime()
    };
  }
}

export default WebSocketServer;