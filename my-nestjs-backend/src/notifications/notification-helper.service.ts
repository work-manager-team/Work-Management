import { Injectable, Inject } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/database.module';
import { notifications, projectMembers } from '../db/schema';
import * as schema from '../db/schema';

@Injectable()
export class NotificationHelperService {
  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
  ) {}

  async notifyUser(
    userId: number,
    type: string,
    title: string,
    message: string,
    taskId?: number,
    projectId?: number,
  ): Promise<void> {
    await this.db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      taskId: taskId || null,
      projectId: projectId || null,
      isRead: false,
    });
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
}
