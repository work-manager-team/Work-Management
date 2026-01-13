import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/database.module';
import { notifications, projectMembers } from '../db/schema';
import * as schema from '../db/schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationHelperService {
  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async notifyUser(
    userId: number,
    type: string,
    title: string,
    message: string,
    taskId?: number,
    projectId?: number,
  ): Promise<void> {
    const result = await this.db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      taskId: taskId || null,
      projectId: projectId || null,
      isRead: false,
    }).returning();

    const notification = result[0];

    // Send real-time notification via WebSocket
    try {
      this.notificationsGateway.sendNotificationToUser(userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        taskId: notification.taskId,
        projectId: notification.projectId,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    } catch (error) {
      console.error('Failed to send WebSocket notification:', error);
      // Don't throw - notification is still saved in DB
    }
  }

  async notifyProjectMembers(
    projectId: number,
    excludeUserId: number | null,
    type: string,
    title: string,
    message: string,
    taskId?: number,
  ): Promise<void> {
    const members = await this.db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));

    const activeMembers = members.filter(
      (member) => member.status === 'active' && member.userId !== excludeUserId,
    );

    const notificationPromises = activeMembers.map((member) =>
      this.notifyUser(member.userId, type, title, message, taskId, projectId),
    );

    await Promise.all(notificationPromises);
  }

  async notifyProjectCreated(projectId: number, projectName: string, createdByUserId: number): Promise<void> {
    await this.notifyProjectMembers(
      projectId,
      createdByUserId,
      'project_created',
      'Dự án mới được tạo',
      `Dự án "${projectName}" đã được tạo`,
      undefined,
    );
  }

  async notifyUserAddedToProject(userId: number, projectId: number, projectName: string): Promise<void> {
    await this.notifyUser(
      userId,
      'added_to_project',
      'Bạn được thêm vào dự án',
      `Bạn đã được thêm vào dự án "${projectName}"`,
      undefined,
      projectId,
    );
  }

  async notifySprintCreated(projectId: number, sprintName: string, createdByUserId: number): Promise<void> {
    await this.notifyProjectMembers(
      projectId,
      createdByUserId,
      'sprint_created',
      'Sprint mới được tạo',
      `Sprint "${sprintName}" đã được tạo`,
      undefined,
    );
  }

  async notifyTaskCreated(projectId: number, taskId: number, taskTitle: string, createdByUserId: number): Promise<void> {
    await this.notifyProjectMembers(
      projectId,
      createdByUserId,
      'task_created',
      'Task mới được tạo',
      `Task mới: "${taskTitle}"`,
      taskId,
    );
  }

  async notifyTaskAssigned(taskId: number, taskTitle: string, assigneeId: number, assignedByUserId: number, projectId: number): Promise<void> {
    if (assigneeId !== assignedByUserId) {
      await this.notifyUser(
        assigneeId,
        'task_assigned',
        'Task được gán cho bạn',
        `Bạn được gán task: "${taskTitle}"`,
        taskId,
        projectId,
      );
    }
  }

  async notifyTaskStatusChanged(
    projectId: number,
    taskId: number,
    taskTitle: string,
    oldStatus: string,
    newStatus: string,
    changedByUserId: number,
    assigneeId?: number,
  ): Promise<void> {
    const statusMap: Record<string, string> = {
      'todo': 'Cần làm',
      'in_progress': 'Đang làm',
      'done': 'Hoàn thành',
      'not_completed': 'Chưa hoàn thành',
    };

    // Notify assignee if exists and different from changer
    if (assigneeId && assigneeId !== changedByUserId) {
      await this.notifyUser(
        assigneeId,
        'task_status_changed',
        'Task của bạn được cập nhật trạng thái',
        `Task "${taskTitle}" đã chuyển từ "${statusMap[oldStatus] || oldStatus}" sang "${statusMap[newStatus] || newStatus}"`,
        taskId,
        projectId,
      );
    }
  }

  async notifyTaskDeleted(
    projectId: number,
    taskTitle: string,
    deletedByUserId: number,
    assigneeId?: number,
    reporterId?: number,
  ): Promise<void> {
    const usersToNotify = new Set<number>();

    if (assigneeId && assigneeId !== deletedByUserId) {
      usersToNotify.add(assigneeId);
    }

    if (reporterId && reporterId !== deletedByUserId) {
      usersToNotify.add(reporterId);
    }

    const notificationPromises = Array.from(usersToNotify).map((userId) =>
      this.notifyUser(
        userId,
        'task_deleted',
        'Task đã bị xóa',
        `Task "${taskTitle}" đã bị xóa khỏi dự án`,
        undefined,
        projectId,
      ),
    );

    await Promise.all(notificationPromises);
  }

  async notifySprintStatusChanged(
    projectId: number,
    sprintName: string,
    oldStatus: string,
    newStatus: string,
    changedByUserId: number,
  ): Promise<void> {
    const statusMap: Record<string, string> = {
      'planned': 'Lên kế hoạch',
      'active': 'Đang hoạt động',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
    };

    await this.notifyProjectMembers(
      projectId,
      changedByUserId,
      'sprint_status_changed',
      'Sprint được cập nhật trạng thái',
      `Sprint "${sprintName}" đã chuyển từ "${statusMap[oldStatus] || oldStatus}" sang "${statusMap[newStatus] || newStatus}"`,
      undefined,
    );
  }

  async notifySprintDeleted(
    projectId: number,
    sprintName: string,
    deletedByUserId: number,
  ): Promise<void> {
    await this.notifyProjectMembers(
      projectId,
      deletedByUserId,
      'sprint_deleted',
      'Sprint đã bị xóa',
      `Sprint "${sprintName}" đã bị xóa khỏi dự án`,
      undefined,
    );
  }

  async notifyCommentAdded(
    projectId: number,
    taskId: number,
    taskTitle: string,
    commentedByUserId: number,
    assigneeId?: number,
    reporterId?: number,
  ): Promise<void> {
    const usersToNotify = new Set<number>();

    // Notify assignee
    if (assigneeId && assigneeId !== commentedByUserId) {
      usersToNotify.add(assigneeId);
    }

    // Notify reporter
    if (reporterId && reporterId !== commentedByUserId) {
      usersToNotify.add(reporterId);
    }

    const notificationPromises = Array.from(usersToNotify).map((userId) =>
      this.notifyUser(
        userId,
        'comment_added',
        'Có comment mới trên task của bạn',
        `Task "${taskTitle}" có comment mới`,
        taskId,
        projectId,
      ),
    );

    await Promise.all(notificationPromises);
  }
}
