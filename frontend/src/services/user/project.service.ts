// src/services/project.service.ts

const API_BASE_URL =  'http://localhost:3000';

export interface Project {
  id: number;
  name: string;
  key: string;
  description: string;
  ownerId: number;
  status: string;
  visibility: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetails extends Project {
  memberCount: number;
  totalSprints: number;
  completedSprints: number;
}

export interface ProjectMember {
  userId: number;
  projectId: number;
  role: string;
  status: string;
  invitedBy: number;
  joinedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

class ProjectService {
  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string | number): Promise<Project[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getUserProjects:', error);
      throw error;
    }
  }

  /**
   * Get project details by ID
   */
  async getProjectDetails(projectId: string | number): Promise<ProjectDetails> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/details`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch project details: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getProjectDetails:', error);
      throw error;
    }
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string | number): Promise<ProjectMember[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/members`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch project members: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getProjectMembers:', error);
      throw error;
    }
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId: string | number): Promise<User> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }
}

export default new ProjectService();