import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebSocketTriggerService {
  private readonly logger = new Logger(WebSocketTriggerService.name);
  private readonly websocketUrl: string;
  private readonly isEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.websocketUrl = this.configService.get<string>('WEBSOCKET_SERVER_URL') || '';
    this.isEnabled = !!this.websocketUrl && this.websocketUrl !== 'http://localhost:3001';

    if (this.isEnabled) {
      this.logger.log(`✅ WebSocket trigger enabled. Server: ${this.websocketUrl}`);
    } else {
      this.logger.warn(`⚠️ WebSocket trigger disabled. WEBSOCKET_SERVER_URL not configured.`);
    }
  }

  async triggerNotificationToUser(userId: number, notification: any) {
    if (!this.isEnabled) {
      // Silently skip if not enabled (for local dev or if Render not deployed yet)
      return { success: false, error: 'WebSocket server not configured' };
    }

    try {
      const response = await fetch(`${this.websocketUrl}/notifications/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, notification }),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.logger.debug(`✅ Triggered notification for user ${userId}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`❌ Failed to trigger WebSocket: ${error.message}`);
      // Don't throw - notification saved in DB, WebSocket is optional
      return { success: false, error: error.message };
    }
  }

  async triggerNotificationToUsers(userIds: number[], notification: any) {
    if (!this.isEnabled) {
      return { success: false, error: 'WebSocket server not configured' };
    }

    try {
      const response = await fetch(`${this.websocketUrl}/notifications/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, notification }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.logger.debug(`✅ Triggered notification for ${userIds.length} users`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`❌ Failed to trigger WebSocket: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async triggerNotificationToProject(projectId: number, notification: any) {
    if (!this.isEnabled) {
      return { success: false, error: 'WebSocket server not configured' };
    }

    try {
      const response = await fetch(`${this.websocketUrl}/notifications/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, notification }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.logger.debug(`✅ Triggered notification for project ${projectId}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`❌ Failed to trigger WebSocket: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
