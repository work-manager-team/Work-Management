// Trigger Controller - Nhận webhook từ Vercel REST API
import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly gateway: NotificationsGateway) {}

  /**
   * Trigger notification broadcast từ Vercel REST API
   * POST /notifications/trigger
   */
  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  triggerNotification(@Body() body: {
    userId?: number;
    userIds?: number[];
    projectId?: number;
    notification: any;
  }) {
    const { userId, userIds, projectId, notification } = body;

    if (userId) {
      // Send to single user
      this.gateway.sendNotificationToUser(userId, notification);
    } else if (userIds && userIds.length > 0) {
      // Send to multiple users
      this.gateway.sendNotificationToUsers(userIds, notification);
    } else if (projectId) {
      // Send to all project members
      this.gateway.sendNotificationToProject(projectId, notification);
    }

    return {
      success: true,
      message: 'Notification triggered successfully',
    };
  }

  /**
   * Health check
   * GET /notifications/health
   */
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'WebSocket Notifications Server',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get connection stats
   * GET /notifications/stats
   */
  @Get('stats')
  getStats() {
    return this.gateway.getConnectionStats();
  }
}
