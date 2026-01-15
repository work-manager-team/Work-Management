// services/user/recentActivity.service.ts

export interface RecentActivity {
  type: 'project' | 'task';
  id: string;
  name: string;
  description?: string;
  status?: string;
  projectId?: string; // For tasks - to link back to project
  projectName?: string; // For tasks - to display project name
  timestamp: number;
  eventType?: 'view-detail' | 'view-members' | 'create'; // Track what action was performed
}

class RecentActivityService {
  private readonly STORAGE_KEY = 'jira_recent_activities';
  private readonly MAX_ITEMS = 20; // Keep last 20 items total
  private readonly MAX_DISPLAY = 10; // Max items to return for display

  /**
   * Track when user views a project (with event type)
   */
  trackProjectView(
    project: { id: string; name: string; description?: string },
    eventType: 'view-detail' | 'view-members' | 'create' = 'view-detail'
  ): void {
    const activity: RecentActivity = {
      type: 'project',
      id: project.id,
      name: project.name,
      description: project.description,
      timestamp: Date.now(),
      eventType,
    };
    
    this.addActivity(activity);
  }

  /**
   * Track when user views a task
   */
  trackTaskView(task: { 
    id: string; 
    title: string; 
    description?: string;
    status?: string;
    projectId?: string;
    projectName?: string;
  }): void {
    const activity: RecentActivity = {
      type: 'task',
      id: task.id,
      name: task.title,
      description: task.description,
      status: task.status,
      projectId: task.projectId,
      projectName: task.projectName,
      timestamp: Date.now(),
    };
    
    this.addActivity(activity);
  }

  /**
   * Add activity to storage (handles deduplication and ordering)
   */
  private addActivity(activity: RecentActivity): void {
    try {
      let activities = this.getAllActivities();
      
      // Remove duplicate (same type + same id)
      activities = activities.filter(
        (item) => !(item.type === activity.type && item.id === activity.id)
      );
      
      // Add new activity at the beginning
      activities.unshift(activity);
      
      // Keep only MAX_ITEMS
      if (activities.length > this.MAX_ITEMS) {
        activities = activities.slice(0, this.MAX_ITEMS);
      }
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Failed to save recent activity:', error);
    }
  }

  /**
   * Get all recent activities from storage
   */
  private getAllActivities(): RecentActivity[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const activities = JSON.parse(data) as RecentActivity[];
      
      // Filter out items older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      return activities.filter(activity => activity.timestamp > thirtyDaysAgo);
    } catch (error) {
      console.error('Failed to load recent activities:', error);
      return [];
    }
  }

  /**
   * Get recent projects (sorted by most recent first)
   */
  getRecentProjects(limit: number = this.MAX_DISPLAY): RecentActivity[] {
    const activities = this.getAllActivities();
    return activities
      .filter((activity) => activity.type === 'project')
      .slice(0, limit);
  }

  /**
   * Get recent tasks (sorted by most recent first)
   */
  getRecentTasks(limit: number = this.MAX_DISPLAY): RecentActivity[] {
    const activities = this.getAllActivities();
    return activities
      .filter((activity) => activity.type === 'task')
      .slice(0, limit);
  }

  /**
   * Get all recent items (mixed projects and tasks)
   */
  getRecentItems(limit: number = this.MAX_DISPLAY): RecentActivity[] {
    const activities = this.getAllActivities();
    return activities.slice(0, limit);
  }

  /**
   * Check if an item exists in recent activities
   */
  isRecent(type: 'project' | 'task', id: string): boolean {
    const activities = this.getAllActivities();
    return activities.some(
      (activity) => activity.type === type && activity.id === id
    );
  }

  /**
   * Remove a specific activity
   */
  removeActivity(type: 'project' | 'task', id: string): void {
    try {
      let activities = this.getAllActivities();
      activities = activities.filter(
        (activity) => !(activity.type === type && activity.id === id)
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Failed to remove activity:', error);
    }
  }

  /**
   * Clear all recent activities
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recent activities:', error);
    }
  }

  /**
   * Get formatted time ago string
   */
  getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }
}

// Export singleton instance
export default new RecentActivityService();