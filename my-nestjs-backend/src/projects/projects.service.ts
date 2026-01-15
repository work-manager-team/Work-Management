// src/projects/projects.service.ts
import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { eq, and, count, ilike, desc, or } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../db/database.module';
import { projects, projectMembers, sprints, tasks, taskHistory, users, Project } from '../db/schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import * as schema from '../db/schema';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
  ) {}

  async create(createProjectDto: CreateProjectDto, ownerId: number): Promise<Project> {
    // Create project
    const [project] = await this.db
      .insert(projects)
      .values({
        ...createProjectDto,
        ownerId,
      })
      .returning();

    // Automatically add owner as admin member
    await this.db
      .insert(projectMembers)
      .values({
        projectId: project.id,
        userId: ownerId,
        role: 'admin',
        status: 'active',
        invitedBy: null,
        joinedAt: new Date(),
      });

    return project;
  }

  async findAll(): Promise<Project[]> {
    return await this.db.select().from(projects);
  }

  async searchByName(searchTerm: string): Promise<Project[]> {
    return await this.db
      .select()
      .from(projects)
      .where(ilike(projects.name, `%${searchTerm}%`));
  }

  async getProjectCount(): Promise<number> {
    const [result] = await this.db
      .select({ value: count() })
      .from(projects);
    return result.value;
  }

  async findByUser(userId: number): Promise<Project[]> {
    // Get all projects where user is a member
    const userProjects = await this.db
      .select({
        project: projects,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(
        and(
          eq(projectMembers.userId, userId),
          eq(projectMembers.status, 'active')
        )
      );

    return userProjects.map(up => up.project);
  }

  async findOne(id: number): Promise<Project> {
    const [project] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      throw new NotFoundException(`Project với ID ${id} không tồn tại`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number): Promise<Project> {
    // Check if project exists
    const project = await this.findOne(id);

    // Check if user has permission (must be admin or owner)
    const canUpdate = await this.checkUserPermission(id, userId, ['admin']);
    if (!canUpdate && project.ownerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật project này');
    }

    const [updatedProject] = await this.db
      .update(projects)
      .set({ ...updateProjectDto, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    return updatedProject;
  }

  async remove(id: number, userId: number): Promise<void> {
    const project = await this.findOne(id);

    // Only owner can delete project
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Chỉ owner mới có thể xóa project');
    }

    await this.db.delete(projects).where(eq(projects.id, id));
  }

  // Helper: Check if user has specific role in project
  async checkUserPermission(
    projectId: number,
    userId: number,
    allowedRoles: string[],
  ): Promise<boolean> {
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

  // Helper: Get user's role in project
  async getUserRole(projectId: number, userId: number): Promise<string | null> {
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

    return member ? member.role : null;
  }

  // Get detailed project information
  async getProjectDetails(projectId: number) {
    const project = await this.findOne(projectId);

    // Count total members
    const [memberCount] = await this.db
      .select({ value: count() })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.status, 'active')
        )
      );

    // Count total sprints
    const [sprintCount] = await this.db
      .select({ value: count() })
      .from(sprints)
      .where(eq(sprints.projectId, projectId));

    // Count completed sprints
    const [completedSprintCount] = await this.db
      .select({ value: count() })
      .from(sprints)
      .where(
        and(
          eq(sprints.projectId, projectId),
          eq(sprints.status, 'completed')
        )
      );

    return {
      ...project,
      memberCount: memberCount.value,
      totalSprints: sprintCount.value,
      completedSprints: completedSprintCount.value,
    };
  }

  // Get project activities/history
  async getProjectActivities(projectId: number, limit: number = 50) {
    await this.findOne(projectId); // Check if project exists

    // Get task history for this project
    const activities = await this.db
      .select({
        id: taskHistory.id,
        type: taskHistory.changeType,
        fieldName: taskHistory.fieldName,
        oldValue: taskHistory.oldValue,
        newValue: taskHistory.newValue,
        createdAt: taskHistory.createdAt,
        user: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
        },
        task: {
          id: tasks.id,
          title: tasks.title,
          taskKey: tasks.taskKey,
        },
      })
      .from(taskHistory)
      .innerJoin(tasks, eq(taskHistory.taskId, tasks.id))
      .innerJoin(users, eq(taskHistory.userId, users.id))
      .where(eq(tasks.projectId, projectId))
      .orderBy(desc(taskHistory.createdAt))
      .limit(limit);

    return activities;
  }

  // Get all project invitations for a user
  async getMyInvitations(userId: number) {
    const invitations = await this.db
      .select({
        id: projectMembers.id,
        role: projectMembers.role,
        invitedAt: projectMembers.invitedAt,
        project: {
          id: projects.id,
          name: projects.name,
          key: projects.key,
          description: projects.description,
          status: projects.status,
          visibility: projects.visibility,
        },
        invitedBy: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .leftJoin(users, eq(projectMembers.invitedBy, users.id))
      .where(
        and(
          eq(projectMembers.userId, userId),
          eq(projectMembers.status, 'invited')
        )
      )
      .orderBy(desc(projectMembers.invitedAt));

    return invitations;
  }
}