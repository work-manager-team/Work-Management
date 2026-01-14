// src/services/user/task.service.ts

const API_BASE_URL = 'https://work-management-chi.vercel.app';

class TaskService {
  /**
   * Get all tasks assigned to a specific user
   * @param userId - The user ID
   * @returns Promise with array of tasks
   */
  async getAssignedTasks(userId: string | number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks?assigneeId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch assigned tasks: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getAssignedTasks:', error);
      throw error;
    }
  }

  /**
   * Get task details by ID
   * @param taskId - The task ID
   * @returns Promise with task data
   */
  async getTaskById(taskId: string | number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch task: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getTaskById:', error);
      throw error;
    }
  }

  /**
   * Update task status
   * @param taskId - The task ID
   * @param status - New status
   * @returns Promise with updated task
   */
  async updateTaskStatus(taskId: string | number, status: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      throw error;
    }
  }
}

export default new TaskService();