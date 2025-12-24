// ============================================
// models/Issue.ts - Extended
// ============================================
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type IssueType = 'TASK' | 'STORY' | 'BUG' | 'EPIC' | 'SUBTASK';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface IssueLabel {
  id: string;
  name: string;
  color: string;
}

export interface IssueComment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: User;
  uploadedAt: Date;
}

export interface Issue {
  id: string;
  key: string;                    // e.g., "PROJ-123"
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  
  projectId: string;
  projectName: string;
  
  assignee?: User;
  reporter: User;
  watchers?: User[];
  
  labels?: IssueLabel[];
  
  storyPoints?: number;
  estimatedTime?: number;         // in hours
  loggedTime?: number;            // in hours
  
  dueDate?: Date;
  startDate?: Date;
  
  parentIssueId?: string;         // For subtasks
  sprintId?: string;
  
  commentsCount: number;
  attachmentsCount: number;
  
  position?: number;              // For ordering in columns
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueCreateData {
  title: string;
  description?: string;
  type: IssueType;
  priority?: IssuePriority;
  assigneeId?: string;
  sprintId?: string;
  storyPoints?: number;
  estimatedTime?: number;
  dueDate?: Date;
  labels?: string[];
}

export interface IssueUpdateData {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
  sprintId?: string;
  storyPoints?: number;
  estimatedTime?: number;
  dueDate?: Date;
}

export class IssueModel implements Issue {
  constructor(
    public id: string,
    public key: string,
    public title: string,
    public type: IssueType,
    public status: IssueStatus,
    public priority: IssuePriority,
    public projectId: string,
    public projectName: string,
    public reporter: User,
    public commentsCount: number,
    public attachmentsCount: number,
    public createdAt: Date,
    public updatedAt: Date,
    public description?: string,
    public assignee?: User,
    public watchers?: User[],
    public labels?: IssueLabel[],
    public storyPoints?: number,
    public estimatedTime?: number,
    public loggedTime?: number,
    public dueDate?: Date,
    public startDate?: Date,
    public parentIssueId?: string,
    public sprintId?: string,
    public position?: number
  ) {}

  // Check if issue is overdue
  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date(this.dueDate) < new Date();
  }

  // Get status color
  get statusColor(): string {
    const colors: Record<IssueStatus, string> = {
      'TODO': '#6b7280',
      'IN_PROGRESS': '#3b82f6',
      'IN_REVIEW': '#f59e0b',
      'DONE': '#10b981',
      'BLOCKED': '#ef4444'
    };
    return colors[this.status];
  }

  // Get priority color
  get priorityColor(): string {
    const colors: Record<IssuePriority, string> = {
      'LOW': '#6b7280',
      'MEDIUM': '#3b82f6',
      'HIGH': '#f59e0b',
      'URGENT': '#ef4444'
    };
    return colors[this.priority];
  }

  // Check if user is assignee
  isAssignedTo(userId: string): boolean {
    return this.assignee?.id === userId;
  }

  // Check if user is watcher
  isWatchedBy(userId: string): boolean {
    return this.watchers?.some(watcher => watcher.id === userId) || false;
  }

  // Get completion percentage
  get completionPercentage(): number {
    if (this.status === 'DONE') return 100;
    if (this.status === 'IN_REVIEW') return 80;
    if (this.status === 'IN_PROGRESS') return 50;
    return 0;
  }
}