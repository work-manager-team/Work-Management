// pages/dashboard/components/StarredContent.tsx
import React, { useState, useEffect } from 'react';
import { Star, FolderOpen, CheckSquare, X } from 'lucide-react';
import starredService, { StarredProject, StarredTask } from '../../../services/user/starred.service';
import './StarredContent.css';

interface StarredContentProps {
  onProjectClick?: (projectId: string) => void;
  onTaskClick?: (taskId: string, projectId?: string) => void;
}

const StarredContent: React.FC<StarredContentProps> = ({
  onProjectClick,
  onTaskClick
}) => {
  const [starredProjects, setStarredProjects] = useState<StarredProject[]>([]);
  const [starredTasks, setStarredTasks] = useState<StarredTask[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'projects' | 'tasks'>('all');

  useEffect(() => {
    loadStarredItems();
  }, []);

  const loadStarredItems = () => {
    setStarredProjects(starredService.getStarredProjects());
    setStarredTasks(starredService.getStarredTasks());
  };

  const handleRemoveProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    starredService.removeProjectStar(projectId);
    loadStarredItems();
  };

  const handleRemoveTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    starredService.removeTaskStar(taskId);
    loadStarredItems();
  };

  const handleProjectClick = (project: StarredProject) => {
    onProjectClick?.(project.id);
  };

  const handleTaskClick = (task: StarredTask) => {
    onTaskClick?.(task.id, task.projectId);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed':
        return '#00875a';
      case 'in_progress':
      case 'in progress':
        return '#0052cc';
      case 'todo':
        return '#5e6c84';
      case 'active':
        return '#00875a';
      default:
        return '#5e6c84';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter items based on activeFilter
  const displayProjects = activeFilter === 'tasks' ? [] : starredProjects;
  const displayTasks = activeFilter === 'projects' ? [] : starredTasks;
  const hasItems = displayProjects.length > 0 || displayTasks.length > 0;

  if (starredProjects.length === 0 && starredTasks.length === 0) {
    return (
      <div className="starred-empty">
        <Star size={48} className="empty-icon" />
        <h3>No starred items</h3>
        <p>Star projects and tasks to access them quickly</p>
      </div>
    );
  }

  return (
    <div className="starred-content">
      {/* Filter Buttons */}
      <div className="starred-filters">
        <button
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-button ${activeFilter === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveFilter('projects')}
        >
          <FolderOpen size={16} />
          Projects
        </button>
        <button
          className={`filter-button ${activeFilter === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveFilter('tasks')}
        >
          <CheckSquare size={16} />
          Tasks
        </button>
      </div>

      {/* Starred Items List */}
      {!hasItems ? (
        <div className="starred-empty">
          <Star size={48} className="empty-icon" />
          <h3>No {activeFilter === 'all' ? 'starred' : activeFilter} items</h3>
          <p>Star {activeFilter === 'all' ? 'projects and tasks' : activeFilter} to see them here</p>
        </div>
      ) : (
        <div className="starred-items-list">
          {/* Starred Projects */}
          {displayProjects.map((project) => (
            <div
              key={`project-${project.id}`}
              className="starred-item"
              onClick={() => handleProjectClick(project)}
            >
              <div className="item-icon">
                <FolderOpen size={20} />
              </div>

              <div className="item-content">
                <div className="item-header">
                  <span className="item-name">{project.name}</span>
                  <span className="item-type-badge">project</span>
                </div>

                {project.description && (
                  <p className="item-description">{project.description}</p>
                )}

                <div className="item-meta">
                  {project.key && (
                    <span className="project-key">{project.key}</span>
                  )}
                  {project.status && (
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(project.status)}15`,
                        color: getStatusColor(project.status)
                      }}
                    >
                      {formatStatus(project.status)}
                    </span>
                  )}
                </div>
              </div>

              <button
                className="remove-button"
                onClick={(e) => handleRemoveProject(e, project.id)}
                aria-label="Remove from starred"
              >
                <Star size={16} fill="currentColor" />
              </button>
            </div>
          ))}

          {/* Starred Tasks */}
          {displayTasks.map((task) => (
            <div
              key={`task-${task.id}`}
              className="starred-item"
              onClick={() => handleTaskClick(task)}
            >
              <div className="item-icon">
                <CheckSquare 
                  size={20} 
                  style={{ color: getStatusColor(task.status) }}
                />
              </div>

              <div className="item-content">
                <div className="item-header">
                  <span className="item-name">{task.title}</span>
                  <span className="item-type-badge">task</span>
                </div>

                {task.description && (
                  <p className="item-description">{task.description}</p>
                )}

                <div className="item-meta">
                  {task.projectName && (
                    <span className="project-link">
                      <FolderOpen size={12} />
                      {task.projectName}
                    </span>
                  )}
                  {task.status && (
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(task.status)}15`,
                        color: getStatusColor(task.status)
                      }}
                    >
                      {formatStatus(task.status)}
                    </span>
                  )}
                  {task.priority && (
                    <span className="priority-badge">
                      {formatStatus(task.priority)}
                    </span>
                  )}
                </div>
              </div>

              <button
                className="remove-button"
                onClick={(e) => handleRemoveTask(e, task.id)}
                aria-label="Remove from starred"
              >
                <Star size={16} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StarredContent;