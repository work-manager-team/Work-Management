// services/user/starred.service.ts
// Service to manage starred projects and tasks

export interface StarredProject {
  id: string;
  name: string;
  description?: string;
  key?: string;
  status?: string;
  visibility?: string;
  timestamp: number;
}

export interface StarredTask {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  projectName?: string;
  timestamp: number;
}

export type StarredItem = StarredProject | StarredTask;

class StarredService {
  private readonly STORAGE_KEY = 'starred_items';
  private readonly MAX_ITEMS = 100;

  // Get all starred items
  getAllStarred(): { projects: StarredProject[]; tasks: StarredTask[] } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return { projects: [], tasks: [] };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading starred items:', error);
      return { projects: [], tasks: [] };
    }
  }

  // Get starred projects
  getStarredProjects(): StarredProject[] {
    const { projects } = this.getAllStarred();
    return projects.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get starred tasks
  getStarredTasks(): StarredTask[] {
    const { tasks } = this.getAllStarred();
    return tasks.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Check if a project is starred
  isProjectStarred(projectId: string): boolean {
    const { projects } = this.getAllStarred();
    return projects.some(p => p.id === projectId);
  }

  // Check if a task is starred
  isTaskStarred(taskId: string): boolean {
    const { tasks } = this.getAllStarred();
    return tasks.some(t => t.id === taskId);
  }

  // Toggle project starred status
  toggleProjectStar(project: Omit<StarredProject, 'timestamp'>): boolean {
    const starred = this.getAllStarred();
    const existingIndex = starred.projects.findIndex(p => p.id === project.id);

    if (existingIndex !== -1) {
      // Remove from starred
      starred.projects.splice(existingIndex, 1);
      this.saveStarred(starred);
      return false; // Not starred anymore
    } else {
      // Add to starred
      const newProject: StarredProject = {
        ...project,
        timestamp: Date.now()
      };
      starred.projects.unshift(newProject);

      // Keep only MAX_ITEMS
      if (starred.projects.length > this.MAX_ITEMS) {
        starred.projects = starred.projects.slice(0, this.MAX_ITEMS);
      }

      this.saveStarred(starred);
      return true; // Now starred
    }
  }

  // Toggle task starred status
  toggleTaskStar(task: Omit<StarredTask, 'timestamp'>): boolean {
    const starred = this.getAllStarred();
    const existingIndex = starred.tasks.findIndex(t => t.id === task.id);

    if (existingIndex !== -1) {
      // Remove from starred
      starred.tasks.splice(existingIndex, 1);
      this.saveStarred(starred);
      return false; // Not starred anymore
    } else {
      // Add to starred
      const newTask: StarredTask = {
        ...task,
        timestamp: Date.now()
      };
      starred.tasks.unshift(newTask);

      // Keep only MAX_ITEMS
      if (starred.tasks.length > this.MAX_ITEMS) {
        starred.tasks = starred.tasks.slice(0, this.MAX_ITEMS);
      }

      this.saveStarred(starred);
      return true; // Now starred
    }
  }

  // Remove a project from starred
  removeProjectStar(projectId: string): void {
    const starred = this.getAllStarred();
    starred.projects = starred.projects.filter(p => p.id !== projectId);
    this.saveStarred(starred);
  }

  // Remove a task from starred
  removeTaskStar(taskId: string): void {
    const starred = this.getAllStarred();
    starred.tasks = starred.tasks.filter(t => t.id !== taskId);
    this.saveStarred(starred);
  }

  // Clear all starred items
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Clear starred projects
  clearProjects(): void {
    const starred = this.getAllStarred();
    starred.projects = [];
    this.saveStarred(starred);
  }

  // Clear starred tasks
  clearTasks(): void {
    const starred = this.getAllStarred();
    starred.tasks = [];
    this.saveStarred(starred);
  }

  // Private method to save starred items
  private saveStarred(starred: { projects: StarredProject[]; tasks: StarredTask[] }): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(starred));
    } catch (error) {
      console.error('Error saving starred items:', error);
    }
  }

  // Get count of starred items
  getStarredCount(): { projects: number; tasks: number; total: number } {
    const { projects, tasks } = this.getAllStarred();
    return {
      projects: projects.length,
      tasks: tasks.length,
      total: projects.length + tasks.length
    };
  }
}

// Export singleton instance
const starredService = new StarredService();
export default starredService;