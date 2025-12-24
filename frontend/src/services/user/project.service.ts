import axiosInstance from '../api/axios.config';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse, PaginatedResponse } from '../api/types';
import { getErrorMessage } from '../api/helpers';
import { Project } from '../../models/Project';
import axios from 'axios';
class ProjectService {
  /**
   * Get projects by user ID
   */
  async getUserProjects(userId: string): Promise<ApiResponse<Project[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Project[]>>(
        API_ENDPOINTS.PROJECTS.BASE,
        {
          params: { userId }
        }
      );
      //const response = await axios.get("http://localhost:3000/projects?userId=1");
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching user projects:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get single project by ID
   */
  async getProjectById(projectId: string): Promise<ApiResponse<Project>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Project>>(
        API_ENDPOINTS.PROJECTS.BY_ID(projectId)
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching project:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create new project
   */
  async createProject(projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    try {
      const response = await axiosInstance.post<ApiResponse<Project>>(
        API_ENDPOINTS.PROJECTS.BASE,
        projectData
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error creating project:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string, 
    updateData: Partial<Project>
  ): Promise<ApiResponse<Project>> {
    try {
      const response = await axiosInstance.put<ApiResponse<Project>>(
        API_ENDPOINTS.PROJECTS.BY_ID(projectId),
        updateData
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error updating project:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(
        API_ENDPOINTS.PROJECTS.BY_ID(projectId)
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error deleting project:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<any[]>>(
        API_ENDPOINTS.PROJECTS.MEMBERS(projectId)
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching project members:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new ProjectService();
