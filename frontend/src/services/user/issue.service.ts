// ============================================
// services/user/issue.service.ts
// ============================================
import axiosInstance from '../api/axios.config';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse, PaginatedResponse } from '../api/types';
import { getErrorMessage } from '../api/helpers';
import { Issue, IssueCreateData, IssueUpdateData, IssueComment, IssueAttachment } from '../../models/Issue';

class IssueService {
  /**
   * Get all issues in a project
   */
  async getIssuesByProject(
    projectId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      assignee?: string;
      priority?: string;
      search?: string;
      type?: string;
    }
  ): Promise<PaginatedResponse<Issue>> {
    try {
      const response = await axiosInstance.get<PaginatedResponse<Issue>>(
        API_ENDPOINTS.ISSUES.BY_PROJECT(projectId),
        { params }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching issues:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get single issue by ID
   */
  async getIssueById(issueId: string): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Issue>>(
        API_ENDPOINTS.ISSUES.BY_ID(issueId)
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching issue:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create new issue
   */
  async createIssue(
    projectId: string,
    issueData: IssueCreateData
  ): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.post<ApiResponse<Issue>>(
        API_ENDPOINTS.ISSUES.BY_PROJECT(projectId),
        issueData
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error creating issue:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update issue
   */
  async updateIssue(
    issueId: string,
    updateData: IssueUpdateData
  ): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.put<ApiResponse<Issue>>(
        API_ENDPOINTS.ISSUES.BY_ID(issueId),
        updateData
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error updating issue:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update issue status (for drag & drop)
   */
  async updateIssueStatus(
    issueId: string,
    newStatus: string,
    newPosition?: number
  ): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<Issue>>(
        `${API_ENDPOINTS.ISSUES.BY_ID(issueId)}/status`,
        {
          status: newStatus,
          position: newPosition
        }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error updating issue status:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete issue
   */
  async deleteIssue(issueId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(
        API_ENDPOINTS.ISSUES.BY_ID(issueId)
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error deleting issue:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Search issues
   */
  async searchIssues(
    projectId: string,
    searchTerm: string
  ): Promise<ApiResponse<Issue[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Issue[]>>(
        `${API_ENDPOINTS.ISSUES.BY_PROJECT(projectId)}/search`,
        {
          params: { q: searchTerm }
        }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error searching issues:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get issues assigned to user
   */
  async getAssignedIssues(userId: string): Promise<Issue[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Issue[]>>(
        API_ENDPOINTS.ISSUES.BASE,
        {
          params: { assigneeId: userId }
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching assigned issues:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get issues worked on by user
   */
  async getWorkedOnIssues(userId: string): Promise<Issue[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Issue[]>>(
        `${API_ENDPOINTS.ISSUES.BASE}/worked-on`,
        {
          params: { userId }
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching worked on issues:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get issues viewed by user
   */
  async getViewedIssues(userId: string): Promise<Issue[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Issue[]>>(
        `${API_ENDPOINTS.ISSUES.BASE}/viewed`,
        {
          params: { userId }
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching viewed issues:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get starred issues by user
   */
  async getStarredIssues(userId: string): Promise<Issue[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Issue[]>>(
        `${API_ENDPOINTS.ISSUES.BASE}/starred`,
        {
          params: { userId }
        }
      );
      
      return response.data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching starred issues:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // COMMENTS
  // ==========================================

  /**
   * Get comments for an issue
   */
  async getComments(issueId: string): Promise<ApiResponse<IssueComment[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<IssueComment[]>>(
        API_ENDPOINTS.ISSUES.COMMENTS(issueId)
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching comments:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Add comment to issue
   */
  async addComment(
    issueId: string,
    commentText: string
  ): Promise<ApiResponse<IssueComment>> {
    try {
      const response = await axiosInstance.post<ApiResponse<IssueComment>>(
        API_ENDPOINTS.ISSUES.COMMENTS(issueId),
        { content: commentText }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error adding comment:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update comment
   */
  async updateComment(
    issueId: string,
    commentId: string,
    commentText: string
  ): Promise<ApiResponse<IssueComment>> {
    try {
      const response = await axiosInstance.put<ApiResponse<IssueComment>>(
        `${API_ENDPOINTS.ISSUES.COMMENTS(issueId)}/${commentId}`,
        { content: commentText }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error updating comment:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete comment
   */
  async deleteComment(
    issueId: string,
    commentId: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(
        `${API_ENDPOINTS.ISSUES.COMMENTS(issueId)}/${commentId}`
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error deleting comment:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // ATTACHMENTS
  // ==========================================

  /**
   * Get attachments for an issue
   */
  async getAttachments(issueId: string): Promise<ApiResponse<IssueAttachment[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<IssueAttachment[]>>(
        API_ENDPOINTS.ISSUES.ATTACHMENTS(issueId)
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error fetching attachments:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload attachment to issue
   */
  async uploadAttachment(
    issueId: string,
    file: File
  ): Promise<ApiResponse<IssueAttachment>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post<ApiResponse<IssueAttachment>>(
        API_ENDPOINTS.ISSUES.ATTACHMENTS(issueId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error uploading attachment:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(
    issueId: string,
    attachmentId: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(
        `${API_ENDPOINTS.ISSUES.ATTACHMENTS(issueId)}/${attachmentId}`
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error deleting attachment:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // WATCHERS & ASSIGNEES
  // ==========================================

  /**
   * Assign issue to user
   */
  async assignIssue(
    issueId: string,
    userId: string
  ): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<Issue>>(
        `${API_ENDPOINTS.ISSUES.BY_ID(issueId)}/assign`,
        { assigneeId: userId }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error assigning issue:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Unassign issue
   */
  async unassignIssue(issueId: string): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<Issue>>(
        `${API_ENDPOINTS.ISSUES.BY_ID(issueId)}/unassign`
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error unassigning issue:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Add watcher to issue
   */
  async addWatcher(
    issueId: string,
    userId: string
  ): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.post<ApiResponse<Issue>>(
        `${API_ENDPOINTS.ISSUES.BY_ID(issueId)}/watchers`,
        { userId }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error adding watcher:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove watcher from issue
   */
  async removeWatcher(
    issueId: string,
    userId: string
  ): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<Issue>>(
        `${API_ENDPOINTS.ISSUES.BY_ID(issueId)}/watchers/${userId}`
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error removing watcher:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ==========================================
  // LABELS & PRIORITY
  // ==========================================

  /**
   * Add label to issue
   */
  async addLabel(
    issueId: string,
    labelId: string
  ): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.post<ApiResponse<Issue>>(
        `${API_ENDPOINTS.ISSUES.BY_ID(issueId)}/labels`,
        { labelId }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error adding label:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove label from issue
   */
  async removeLabel(
    issueId: string,
    labelId: string
  ): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<Issue>>(
        `${API_ENDPOINTS.ISSUES.BY_ID(issueId)}/labels/${labelId}`
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error removing label:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update issue priority
   */
  async updatePriority(
    issueId: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  ): Promise<ApiResponse<Issue>> {
    try {
      const response = await axiosInstance.patch<ApiResponse<Issue>>(
        `${API_ENDPOINTS.ISSUES.BY_ID(issueId)}/priority`,
        { priority }
      );
      
      return response.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error updating priority:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export default new IssueService();


