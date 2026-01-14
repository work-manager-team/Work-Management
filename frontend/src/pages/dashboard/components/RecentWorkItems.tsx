import React, { useState, useEffect } from 'react';
import './recentWorkItems.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  priority?: string;
  type?: string;
}

interface RecentWorkItemsProps {
  userId:  number;
  onViewAssignedTasks: () => Promise<Task[]>;
}

const RecentWorkItems: React.FC<RecentWorkItemsProps> = ({ 
  userId, 
  onViewAssignedTasks 
}) => {
  const [activeTab, setActiveTab] = useState<string>('worked-on');
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const tabs = [
    { id: 'worked-on', label: 'Worked on' },
    { id: 'viewed', label: 'Viewed' },
    { id: 'assigned', label: 'Assigned to me', count: assignedTasks.length || undefined },
    { id: 'starred', label: 'Starred' },
    
  ];

  const handleTabClick = async (tabId: string) => {
    setActiveTab(tabId);
    
    // If clicked on "Assigned to me" tab, fetch tasks
    if (tabId === 'assigned') {
      setLoadingTasks(true);
      try {
        const tasks = await onViewAssignedTasks();
        setAssignedTasks(tasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setAssignedTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    }
  };

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

  return (
    <div className="recent-work-items">
      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'worked-on' && (
          <div className="empty-state">
            <p>No work items to display</p>
          </div>
        )}

        {activeTab === 'viewed' && (
          <div className="empty-state">
            <p>No viewed items to display</p>
          </div>
        )}

        {activeTab === 'assigned' && (
          <>
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
                        <tr key={task.id}>
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
                <div className="tasks-footer">
                  <p className="tasks-count">
                    Total: {assignedTasks.length} task{assignedTasks.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'starred' && (
          <div className="empty-state">
            <p>No starred items to display</p>
          </div>
        )}

        {activeTab === 'boards' && (
          <div className="empty-state">
            <p>No boards to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentWorkItems;