export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  type?: string;
  avatar?: string;
  openWorkItems?: number;
  boardsCount?: number;
  members?: ProjectMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProjectModel implements Project {
  constructor(
    public id: string,
    public name: string,
    public key: string,
    public description?: string,
    public type?: string,
    public avatar?: string,
    public openWorkItems?: number,
    public boardsCount?: number,
    public members?: ProjectMember[],
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  // Get project initials for avatar
  get initials(): string {
    return this.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  // Check if user is member
  isMember(userId: string): boolean {
    return this.members?.some(member => member.id === userId) || false;
  }

  // Get member by ID
  getMember(userId: string): ProjectMember | undefined {
    return this.members?.find(member => member.id === userId);
  }
}