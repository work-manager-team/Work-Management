// src/sprints/sprints.service.ts
import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../db/database.module';
import { sprints, projectMembers, sprintComments, Sprint, SprintComment } from '../db/schema';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { CreateSprintCommentDto } from './dto/create-sprint-comment.dto';
import * as schema from '../db/schema';

@Injectable()
export class SprintsService {
  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
  ) {}

  async create(createSprintDto: CreateSprintDto, userId: number): Promise<Sprint> {
    // Check if user has permission (at least member)
    const canCreate = await this.checkPermission(createSprintDto.projectId, userId, ['member', 'admin']);
    if (!canCreate) {
      throw new ForbiddenException('Bạn không có quyền tạo sprint trong project này');
    }

    // Validate dates
    if (new Date(createSprintDto.startDate) >= new Date(createSprintDto.endDate)) {
      throw new BadRequestException('Start date phải trước end date');
    }

    const [sprint] = await this.db
      .insert(sprints)
      .values(createSprintDto)
      .returning();

    return sprint;
  }

  async findAllByProject(projectId: number): Promise<Sprint[]> {
    return await this.db
      .select()
      .from(sprints)
      .where(eq(sprints.projectId, projectId));
  }

  async findOne(id: number): Promise<Sprint> {
    const [sprint] = await this.db
      .select()
      .from(sprints)
      .where(eq(sprints.id, id));

    if (!sprint) {
      throw new NotFoundException(`Sprint với ID ${id} không tồn tại`);
    }

    return sprint;
  }

  async update(id: number, updateSprintDto: UpdateSprintDto, userId: number): Promise<Sprint> {
    const sprint = await this.findOne(id);

    // Check permission
    const canUpdate = await this.checkPermission(sprint.projectId, userId, ['member', 'admin']);
    if (!canUpdate) {
      throw new ForbiddenException('Bạn không có quyền cập nhật sprint này');
    }

    // Validate dates if provided
    const startDate = updateSprintDto.startDate ? new Date(updateSprintDto.startDate) : new Date(sprint.startDate);
    const endDate = updateSprintDto.endDate ? new Date(updateSprintDto.endDate) : new Date(sprint.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date phải trước end date');
    }

    const [updated] = await this.db
      .update(sprints)
      .set({ ...updateSprintDto, updatedAt: new Date() })
      .where(eq(sprints.id, id))
      .returning();

    return updated;
  }

  async remove(id: number, userId: number): Promise<void> {
    const sprint = await this.findOne(id);

    // Check permission (only admin)
    const canDelete = await this.checkPermission(sprint.projectId, userId, ['admin']);
    if (!canDelete) {
      throw new ForbiddenException('Bạn không có quyền xóa sprint này');
    }

    await this.db.delete(sprints).where(eq(sprints.id, id));
  }

  async startSprint(id: number, userId: number): Promise<Sprint> {
    const sprint = await this.findOne(id);

    if (sprint.status !== 'planned') {
      throw new BadRequestException('Chỉ có thể start sprint đang ở trạng thái planned');
    }

    const canStart = await this.checkPermission(sprint.projectId, userId, ['member', 'admin']);
    if (!canStart) {
      throw new ForbiddenException('Bạn không có quyền start sprint');
    }

    const [updated] = await this.db
      .update(sprints)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(sprints.id, id))
      .returning();

    return updated;
  }

  async completeSprint(id: number, userId: number): Promise<Sprint> {
    const sprint = await this.findOne(id);

    if (sprint.status !== 'active') {
      throw new BadRequestException('Chỉ có thể complete sprint đang active');
    }

    const canComplete = await this.checkPermission(sprint.projectId, userId, ['member', 'admin']);
    if (!canComplete) {
      throw new ForbiddenException('Bạn không có quyền complete sprint');
    }

    const [updated] = await this.db
      .update(sprints)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(sprints.id, id))
      .returning();

    return updated;
  }

  async cancelSprint(id: number, userId: number): Promise<Sprint> {
    const sprint = await this.findOne(id);

    if (sprint.status === 'completed') {
      throw new BadRequestException('Không thể cancel sprint đã hoàn thành');
    }

    if (sprint.status === 'cancelled') {
      throw new BadRequestException('Sprint đã bị cancel rồi');
    }

    const canCancel = await this.checkPermission(sprint.projectId, userId, ['admin']);
    if (!canCancel) {
      throw new ForbiddenException('Chỉ admin mới có quyền cancel sprint');
    }

    const [updated] = await this.db
      .update(sprints)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(sprints.id, id))
      .returning();

    return updated;
  }

  async updateSprintStatus(
    id: number,
    newStatus: 'planned' | 'active' | 'completed' | 'cancelled',
    userId: number,
  ): Promise<Sprint> {
    const sprint = await this.findOne(id);

    // Validate status transitions based on permissions
    const currentStatus = sprint.status;

    // Check permissions based on transition
    if (newStatus === 'cancelled') {
      // Only admin can cancel
      const canCancel = await this.checkPermission(sprint.projectId, userId, ['admin']);
      if (!canCancel) {
        throw new ForbiddenException('Chỉ admin mới có quyền cancel sprint');
      }
    } else {
      // Member or admin can change to other statuses
      const canUpdate = await this.checkPermission(sprint.projectId, userId, ['member', 'admin']);
      if (!canUpdate) {
        throw new ForbiddenException('Bạn không có quyền thay đổi status sprint');
      }
    }

    // Business logic validation
    if (currentStatus === newStatus) {
      throw new BadRequestException(`Sprint đã ở trạng thái ${newStatus} rồi`);
    }

    // Prevent certain invalid transitions
    if (currentStatus === 'completed' && newStatus !== 'completed') {
      throw new BadRequestException('Không thể thay đổi sprint đã hoàn thành');
    }

    if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
      throw new BadRequestException('Không thể thay đổi sprint đã bị cancel');
    }

    // Update status
    const [updated] = await this.db
      .update(sprints)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(sprints.id, id))
      .returning();

    return updated;
  }

  // Sprint Comments
  async createComment(createCommentDto: CreateSprintCommentDto, userId: number): Promise<SprintComment> {
    const sprint = await this.findOne(createCommentDto.sprintId);

    // Check if user has access to project
    const hasAccess = await this.checkPermission(sprint.projectId, userId, ['viewer', 'member', 'admin']);
    if (!hasAccess) {
      throw new ForbiddenException('Bạn không có quyền comment trên sprint này');
    }

    // Validate parent comment if provided
    if (createCommentDto.parentCommentId) {
      const [parentComment] = await this.db
        .select()
        .from(sprintComments)
        .where(eq(sprintComments.id, createCommentDto.parentCommentId));

      if (!parentComment) {
        throw new NotFoundException('Parent comment không tồn tại');
      }

      if (parentComment.sprintId !== createCommentDto.sprintId) {
        throw new ForbiddenException('Parent comment không thuộc sprint này');
      }
    }

    const result = await this.db
      .insert(sprintComments)
      .values({
        sprintId: createCommentDto.sprintId,
        userId,
        content: createCommentDto.content,
        parentCommentId: createCommentDto.parentCommentId,
      })
      .returning();

    return result[0];
  }

  async getComments(sprintId: number, userId: number): Promise<SprintComment[]> {
    const sprint = await this.findOne(sprintId);

    // Check access
    const hasAccess = await this.checkPermission(sprint.projectId, userId, ['viewer', 'member', 'admin']);
    if (!hasAccess) {
      throw new ForbiddenException('Bạn không có quyền xem comments của sprint này');
    }

    // Get all top-level comments (no parent)
    return await this.db
      .select()
      .from(sprintComments)
      .where(
        and(
          eq(sprintComments.sprintId, sprintId),
          isNull(sprintComments.parentCommentId)
        )
      );
  }

  async getCommentReplies(commentId: number, userId: number): Promise<SprintComment[]> {
    const [comment] = await this.db
      .select()
      .from(sprintComments)
      .where(eq(sprintComments.id, commentId));

    if (!comment) {
      throw new NotFoundException('Comment không tồn tại');
    }

    const sprint = await this.findOne(comment.sprintId);
    const hasAccess = await this.checkPermission(sprint.projectId, userId, ['viewer', 'member', 'admin']);
    if (!hasAccess) {
      throw new ForbiddenException('Bạn không có quyền xem replies');
    }

    return await this.db
      .select()
      .from(sprintComments)
      .where(eq(sprintComments.parentCommentId, commentId));
  }

  // Helper
  private async checkPermission(projectId: number, userId: number, allowedRoles: string[]): Promise<boolean> {
    const [member] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
          eq(projectMembers.status, 'active')
        )
      );

    if (!member) {
      return false;
    }

    return allowedRoles.includes(member.role);
  }
}