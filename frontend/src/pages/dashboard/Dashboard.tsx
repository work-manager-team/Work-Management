// pages/dashboard/Dashboard.tsx - UPDATED WITH STARRED TAB

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';

// Import components
import ProjectCard from './components/ProjectCard';
import RecentActivities from './components/RecentActivities';
import StarredContent from './components/StarredContent';
import TaskDetailModal from './components/TaskDetailModal';

// Import services
import projectService from '../../services/user/project.service';
import taskService from '../../services/user/task.service';
import authService from '../../services/user/auth.service';
import recentActivityService from '../../services/user/recentActivity.service';

// Import types
import { Project } from '../../models/Project';

// Import styles
import './dashboard.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  projectName?: string;
  priority?: string;
  type?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  // Modal state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // ⭐ UPDATED: Unified tabs state with 'starred' tab
  const [activeTab, setActiveTab] = useState<'recent' | 'assigned' | 'starred'>('recent');
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Get current user ID
  const user = localStorage.getItem('user');
  const currentUserId = user ? JSON.parse(user).id : null;

  // Fetch projects on mount
  useEffect(() => {
    fetchUserProjects();
  }, [currentUserId]);

  const fetchUserProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await projectService.getUserProjects(currentUserId);
      const projectsData = Array.isArray(response) ? response : ((response as any).data || []);
      setProjects(projectsData);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch assigned tasks
  const fetchAssignedTasks = async () => {
    setLoadingTasks(true);
    try {
      const tasksData = await taskService.getAssignedTasks(currentUserId);
      
      const formattedTasks = tasksData.map((task: any) => ({
        id: task.id?.toString() || '',
        title: task.title || 'Untitled Task',
        description: task.description || '',
        status: task.status || 'todo',
        projectId: task.projectId?.toString() || '',
        projectName: '',
        priority: task.priority || '',
        type: task.type || '',
        dueDate: task.dueDate || null
      }));

      setAssignedTasks(formattedTasks);
    } catch (err: any) {
      console.error('Error fetching assigned tasks:', err);
      setAssignedTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // ⭐ UPDATED: Handle tab change
  const handleTabChange = (tab: 'recent' | 'assigned' | 'starred') => {
    setActiveTab(tab);
    
    // Fetch tasks if switching to assigned tab
    if (tab === 'assigned' && assignedTasks.length === 0) {
      fetchAssignedTasks();
    }
  };

  // Handlers
  const handleViewAllProjects = () => {
    setShowAllProjects(true);
  };

  const handleCloseModal = () => {
    setShowAllProjects(false);
  };

  const handleProjectClick = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      // Get the event type from recent activity
      const recentItems = recentActivityService.getRecentItems(100);
      const projectActivity = recentItems.find(item => item.type === 'project' && item.id === projectId);
      const eventType = projectActivity?.eventType || 'view-detail';
      
      // Navigate to projects page with event type
      navigate(`/projects/${projectId}`, { state: { eventType } });
    } else {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleProjectDetailClick = (projectId: string) => {
    navigate(`/projects/${projectId}`, { state: { eventType: 'view-detail' } });
  };

  const handleProjectMembersClick = (projectId: string) => {
    navigate(`/projects/${projectId}`, { state: { eventType: 'view-members' } });
  };

  const handleTaskClick = (taskId: string, projectId?: string) => {
    setSelectedTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  // Utility functions for status
  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'done') return 'status-completed';
    if (statusLower === 'in_progress' || statusLower === 'in progress') return 'status-in-progress';
    if (statusLower === 'todo' || statusLower === 'to do') return 'status-todo';
    return 'status-default';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const displayedProjects = projects.slice(0, 3);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">For you</h1>
      </div>

      {/* ⭐ UPDATED: Unified Section with Tabs including Starred */}
      <section className="unified-section">
        {/* Tabs Navigation */}
        <div className="unified-tabs">
          <button
            className={`unified-tab ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => handleTabChange('recent')}
          >
            Recently viewed
          </button>
          <button
            className={`unified-tab ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => handleTabChange('assigned')}
          >
            Assigned to me
            {assignedTasks.length > 0 && (
              <span className="tab-badge">{assignedTasks.length}</span>
            )}
          </button>
          <button
            className={`unified-tab ${activeTab === 'starred' ? 'active' : ''}`}
            onClick={() => handleTabChange('starred')}
          >
            Starred
          </button>
        </div>

        {/* Tab Content */}
        <div className="unified-content">
          {/* Recently Viewed Tab */}
          {activeTab === 'recent' && (
            <RecentActivities
              onProjectClick={handleProjectClick}
              onTaskClick={handleTaskClick}
            />
          )}

          {/* Assigned to Me Tab */}
          {activeTab === 'assigned' && (
            <div className="assigned-tasks-content">
              {loadingTasks ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading your tasks...</p>
                </div>
              ) : assignedTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <h3>No tasks assigned</h3>
                  <p>You don't have any tasks assigned to you yet</p>
                </div>
              ) : (
                <div className="tasks-content">
                  <div className="tasks-table-wrapper">
                    <table className="tasks-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedTasks.map((task) => (
                          <tr 
                            key={task.id}
                            onClick={() => handleTaskClick(task.id)}
                            className="task-row-clickable"
                          >
                            <td className="task-title">{task.title}</td>
                            <td className="task-description">
                              {task.description || '-'}
                            </td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                                {formatStatus(task.status)}
                              </span>
                            </td>
                            <td className="task-priority">
                              {task.priority ? formatStatus(task.priority) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                </div>
              )}
            </div>
          )}

          {/* ⭐ NEW: Starred Tab */}
          {activeTab === 'starred' && (
            <StarredContent
              onProjectClick={handleProjectClick}
              onTaskClick={handleTaskClick}
            />
          )}
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your spaces...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchUserProjects} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
        />
      )}
    </div>
  );
};

export default Dashboard;