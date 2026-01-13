// src/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'https://work-management-chi.vercel.app',
      /\.vercel\.app$/,
    ],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<number, Set<string>> = new Map(); // userId -> Set of socket IDs

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.userId;

      if (!userId) {
        this.logger.warn(`Client ${client.id} connection rejected: Invalid token`);
        client.disconnect();
        return;
      }

      // Store user-socket mapping
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(client.id);

      // Store userId in socket data for later use
      client.data.userId = userId;

      // Join user to their personal room
      client.join(`user:${userId}`);

      this.logger.log(`✅ Client ${client.id} connected (User ${userId})`);
      this.logger.debug(`Active sockets for User ${userId}: ${this.userSockets.get(userId)?.size}`);

      // Send connection confirmation
      client.emit('connected', {
        message: 'Connected to notifications',
        userId,
      });
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);

        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }

      this.logger.log(`❌ Client ${client.id} disconnected (User ${userId})`);
    } else {
      this.logger.log(`❌ Client ${client.id} disconnected (unauthenticated)`);
    }
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: number, notification: any) {
    const room = `user:${userId}`;
    this.server.to(room).emit('notification', notification);
    this.logger.debug(`📤 Sent notification to User ${userId}: ${notification.type}`);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: number[], notification: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Send notification to all project members
   */
  sendNotificationToProject(projectId: number, notification: any) {
    const room = `project:${projectId}`;
    this.server.to(room).emit('notification', notification);
    this.logger.debug(`📤 Sent notification to Project ${projectId}: ${notification.type}`);
  }

  /**
   * Client subscribes to project notifications
   */
  @SubscribeMessage('subscribe:project')
  handleSubscribeProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: number },
  ) {
    const room = `project:${data.projectId}`;
    client.join(room);
    this.logger.log(`User ${client.data.userId} subscribed to Project ${data.projectId}`);
    return { success: true, message: `Subscribed to project ${data.projectId}` };
  }

  /**
   * Client unsubscribes from project notifications
   */
  @SubscribeMessage('unsubscribe:project')
  handleUnsubscribeProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: number },
  ) {
    const room = `project:${data.projectId}`;
    client.leave(room);
    this.logger.log(`User ${client.data.userId} unsubscribed from Project ${data.projectId}`);
    return { success: true, message: `Unsubscribed from project ${data.projectId}` };
  }

  /**
   * Mark notification as read
   */
  @SubscribeMessage('notification:read')
  handleNotificationRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: number },
  ) {
    // Broadcast to all user's connected devices
    const userId = client.data.userId;
    this.server.to(`user:${userId}`).emit('notification:marked_read', {
      notificationId: data.notificationId,
    });
    return { success: true };
  }

  /**
   * Get connection stats (for debugging)
   */
  getConnectionStats() {
    const stats = {
      totalUsers: this.userSockets.size,
      totalSockets: Array.from(this.userSockets.values()).reduce(
        (sum, sockets) => sum + sockets.size,
        0,
      ),
      users: Array.from(this.userSockets.entries()).map(([userId, sockets]) => ({
        userId,
        socketCount: sockets.size,
      })),
    };
    return stats;
  }
}
