import { api } from './api.service';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  taskId?: number | null;
  projectId?: number;
}

interface UnreadCountResponse {
  count: number;
}

class NotificationService {
  /**
   * Get user notifications
   * Endpoint: GET /notifications/user/:userId
   * Auth Required: Yes
   */
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const data = await api.get<Notification[] | { data: Notification[] }>(`/notifications/user/${userId}`);
    return Array.isArray(data) ? data : data.data || [];
  }

  /**
   * Get unread notifications
   * Endpoint: GET /notifications/user/:userId/unread
   * Auth Required: Yes
   */
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    const data = await api.get<Notification[] | { data: Notification[] }>(`/notifications/user/${userId}/unread`);
    return Array.isArray(data) ? data : data.data || [];
  }

  /**
   * Get unread count
   * Endpoint: GET /notifications/user/:userId/count
   * Auth Required: Yes
   */
  async getUnreadCount(userId: number): Promise<number> {
    const data = await api.get<UnreadCountResponse>(`/notifications/user/${userId}/count`);
    return data.count || 0;
  }

  /**
   * Mark notification as read
   * Endpoint: PATCH /notifications/:id/read
   * Auth Required: Yes
   */
  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  }

  /**
   * Mark all as read
   * Endpoint: PATCH /notifications/user/:userId/read-all
   * Auth Required: Yes
   */
  async markAllAsRead(userId: number): Promise<void> {
    await api.patch(`/notifications/user/${userId}/read-all`);
  }

  /**
   * Delete notification
   * Endpoint: DELETE /notifications/:id
   * Auth Required: Yes
   */
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  /**
   * Delete all notifications
   * Endpoint: DELETE /notifications/user/:userId/all
   * Auth Required: Yes
   */
  async deleteAllNotifications(userId: number): Promise<void> {
    await api.delete(`/notifications/user/${userId}/all`);
  }
}

export const notificationService = new NotificationService();
