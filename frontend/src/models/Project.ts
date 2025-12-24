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
  description: string;
  ownerId: string;
  status: string;
  visibility: string;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProjectModel implements Project {
  constructor(
    public id: string,
    public name: string,
    public key: string,
    public description: string,
    public ownerId: string,
    public status: string,
    public visibility: string,
    public startDate: Date,
    public endDate: Date,
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
}