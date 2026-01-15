// components/RecentActivities.tsx
import React, { useState, useEffect } from 'react';
import { Clock, FolderOpen, CheckSquare, X, Eye, Users, Plus, Pencil, Trash2 } from 'lucide-react';
import recentActivityService, { RecentActivity } from '../../../services/user/recentActivity.service';
import './RecentActivities.css';

interface RecentActivitiesProps {
  onProjectClick?: (projectId: string) => void;
  onTaskClick?: (taskId: string, projectId?: string) => void;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  onProjectClick,
  onTaskClick
}) => {
  const [recentItems, setRecentItems] = useState<RecentActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'tasks'>('all');

  useEffect(() => {
    loadRecentItems();
  }, [activeTab]);

  const loadRecentItems = () => {
    let items: RecentActivity[] = [];
    
    switch (activeTab) {
      case 'projects':
        items = recentActivityService.getRecentProjects(10);
        break;
      case 'tasks':
        items = recentActivityService.getRecentTasks(10);
        break;
      default:
        items = recentActivityService.getRecentItems(10);
    }
    
    setRecentItems(items);
  };

  const getEventLabel = (eventType?: string): string => {
    switch (eventType) {
      case 'create':
        return 'Created project';
      case 'view-detail':
        return 'Viewed details';
      case 'view-members':
        return 'Viewed members';
      case 'add-member':
        return 'Added member';
      case 'delete-member':
        return 'Deleted member';
      case 'update':
        return 'Updated project';
      default:
        return 'Viewed';
    }
  };

  const getEventIcon = (eventType?: string) => {
    switch (eventType) {
      case 'create':
        return <Plus size={14} />;
      case 'view-detail':
        return <Eye size={14} />;
      case 'view-members':
        return <Users size={14} />;
      case 'add-member':
        return <Plus size={14} />;
      case 'delete-member':
        return <Trash2 size={14} />;
      case 'update':
        return <Pencil size={14} />;
      default:
        return <Eye size={14} />;
    }
  };

  const handleItemClick = (item: RecentActivity) => {
    if (item.type === 'project') {
      // Navigate to project page with event type in state
      // The project page will handle opening the appropriate modal
      onProjectClick?.(item.id);
    } else if (item.type === 'task' && onTaskClick) {
      onTaskClick(item.id, item.projectId);
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, item: RecentActivity) => {
    e.stopPropagation();
    recentActivityService.removeActivity(item.type, item.id);
    loadRecentItems();
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
        return '#00875a';
      case 'in progress':
        return '#0052cc';
      case 'todo':
        return '#5e6c84';
      default:
        return '#5e6c84';
    }
  };

  if (recentItems.length === 0) {
    return (
      <div className="recent-activities-empty">
        <Clock size={48} className="empty-icon" />
        <h3>No recent activity</h3>
        <p>Your recently viewed projects and tasks will appear here</p>
      </div>
    );
  }

  return (
    <div className="recent-activities">
      {/* Tabs */}
      <div className="recent-tabs">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderOpen size={16} />
          Projects
        </button>
        <button
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={16} />
          Tasks
        </button>
      </div>

      {/* Recent Items List */}
      <div className="recent-items-list">
        {recentItems.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="recent-item"
            onClick={() => handleItemClick(item)}
          >
            <div className="item-icon">
              {item.type === 'project' ? (
                <FolderOpen size={20} />
              ) : (
                <CheckSquare 
                  size={20} 
                  style={{ color: getStatusColor(item.status) }}
                />
              )}
            </div>

            <div className="item-content">
              <div className="item-header">
                <span className="item-name">{item.name}</span>
                <span className="item-type-badge">
                  {item.type}
                </span>
              </div>

              {item.description && (
                <p className="item-description">{item.description}</p>
              )}

              <div className="item-meta">
                {/* Event Type Badge for Projects */}
                {item.type === 'project' && item.eventType && (
                  <span className="event-type-badge">
                    {getEventIcon(item.eventType)}
                    {getEventLabel(item.eventType)}
                  </span>
                )}
                
                {item.projectName && (
                  <span className="project-link">
                    <FolderOpen size={12} />
                    {item.projectName}
                  </span>
                )}
                {item.status && (
                  <span 
                    className="task-status"
                    style={{ 
                      backgroundColor: `${getStatusColor(item.status)}15`,
                      color: getStatusColor(item.status)
                    }}
                  >
                    {item.status}
                  </span>
                )}
                <span className="item-time">
                  <Clock size={12} />
                  {recentActivityService.getTimeAgo(item.timestamp)}
                </span>
              </div>
            </div>

            <button
              className="remove-button"
              onClick={(e) => handleRemoveItem(e, item)}
              aria-label="Remove from recent"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;