// pages/dashboard/components/TaskDetailModal.tsx
// Modal hiển thị chi tiết task trong Dashboard

import React, { useState, useEffect, useRef } from 'react';
import { X, User, Calendar, Clock, Loader } from 'lucide-react';
import { apiCall } from '../../../utils/api';
import './TaskDetailModal.css';

const API_BASE_URL = 'https://work-management-chi.vercel.app';

interface Task {
  id: number;
  projectId: number;
  taskNumber: number;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  reporterId: number;
  assigneeId: number | null;
  sprintId: number | null;
  parentTaskId: number | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: number;
  name: string;
  key: string;
}

interface Assignee {
  id: number;
  fullName: string;
  email: string;
}

interface TaskDetailModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  isOpen,
  onClose
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [assignee, setAssignee] = useState<Assignee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const lastFetchedTaskId = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch if modal is open, has taskId, not currently fetching,
    // and taskId is different from last fetched
    if (isOpen && taskId && !isFetching && lastFetchedTaskId.current !== taskId) {
      lastFetchedTaskId.current = taskId;
      fetchTaskDetails();
    }
    
    // Reset when modal closes
    if (!isOpen) {
      lastFetchedTaskId.current = null;
    }
  }, [isOpen, taskId]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchTaskDetails = async () => {
    // Prevent double fetch
    if (isFetching) {
      console.log('⏭️ Already fetching, skipping...');
      return;
    }

    setIsFetching(true);
    setLoading(true);
    setError(null);
    setTask(null);
    setProject(null);
    setAssignee(null);

    try {
      // 1. Fetch task
      console.log('📥 Fetching task:', taskId);
      const taskResponse = await apiCall(`${API_BASE_URL}/tasks/${taskId}`);
      
      if (!taskResponse.ok) {
        throw new Error('Task not found');
      }

      const taskData = await taskResponse.json();
      console.log('✅ Task data:', taskData);
      setTask(taskData);

      // 2. Fetch project (optional - won't block)
      if (taskData.projectId) {
        try {
          console.log('📥 Fetching project:', taskData.projectId);
          const projectResponse = await apiCall(`${API_BASE_URL}/projects/${taskData.projectId}`);
          if (projectResponse.ok) {
            const projectData = await projectResponse.json();
            console.log('✅ Project data:', projectData);
            setProject(projectData);
          }
        } catch (err) {
          console.error('⚠️ Failed to fetch project:', err);
        }
      }

      // 3. Fetch assignee (optional - won't block)
      if (taskData.assigneeId) {
        try {
          console.log('📥 Fetching assignee:', taskData.assigneeId);
          const assigneeResponse = await apiCall(`${API_BASE_URL}/users/${taskData.assigneeId}`);
          
          // ✅ Chấp nhận 2xx và 3xx (bao gồm 304 Not Modified)
          if (assigneeResponse.status < 400) {
            if (assigneeResponse.ok) {
              // Status 2xx: Parse data bình thường
              const assigneeData = await assigneeResponse.json();
              console.log('✅ Assignee data:', assigneeData);
              setAssignee(assigneeData);
            } else {
              // Status 3xx (như 304): Coi như OK nhưng không có data mới
              console.log(`ℹ️ Got ${assigneeResponse.status} for assignee - treating as no new data`);
            }
          } else {
            // Status 4xx, 5xx: Không làm gì, sẽ show "Unassigned"
            console.log(`⚠️ Got ${assigneeResponse.status} for assignee - will show as Unassigned`);
          }
        } catch (err) {
          console.error('⚠️ Failed to fetch assignee:', err);
        }
      } else {
        console.log('ℹ️ Task has no assignee');
      }
    } catch (err: any) {
      console.error('❌ Error fetching task:', err);
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase().replace(/\s+/g, '-')) {
      case 'done': return '#00875a';
      case 'in-progress':
      case 'in progress': return '#0052cc';
      case 'todo': return '#5e6c84';
      case 'blocked': return '#de350b';
      default: return '#5e6c84';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return '#de350b';
      case 'high': return '#ff5630';
      case 'medium': return '#ff991f';
      case 'low': return '#36b37e';
      default: return '#5e6c84';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">Task Details</h2>
            
              
            
          </div>
          <div className="modal-header-actions">
            <button
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <Loader className="spinner" size={32} />
              <p>Loading task...</p>
            </div>
          )}

          {error && (
            <div className="modal-error">
              <p>{error}</p>
              <button onClick={fetchTaskDetails} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && task && (
            <>
              {/* Task Info */}
              <div className="task-info-section">
                <div className="task-type-row">
                  <span className="task-type-badge">{task.type}</span>
                  <div className="task-badges">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: `${getStatusColor(task.status)}15`,
                        color: getStatusColor(task.status)
                      }}
                    >
                      {formatStatus(task.status)}
                    </span>
                    <span
                      className="priority-badge"
                      style={{
                        backgroundColor: `${getPriorityColor(task.priority)}15`,
                        color: getPriorityColor(task.priority)
                      }}
                    >
                      {formatStatus(task.priority)}
                    </span>
                  </div>
                </div>

                <h3 className="task-title">{task.title}</h3>

                {task.description && (
                  <div className="task-description">
                    <h4>Description</h4>
                    <p>{task.description}</p>
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="task-details-grid">
                {/* Project */}
                {project && (
                  <div className="detail-item">
                    <span className="detail-label">Project</span>
                    <span className="detail-value">
                      {project.key} - {project.name}
                    </span>
                  </div>
                )}

                {/* Assignee */}
                <div className="detail-item">
                  <span className="detail-label">
                    <User size={14} />
                    Assignee
                  </span>
                  {assignee ? (
                    <div className="assignee-info-modal">
                      <div className="assignee-avatar-modal">
                        {assignee.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="assignee-details-modal">
                        <div className="assignee-name-modal">{assignee.fullName}</div>
                        {assignee.email && (
                          <div className="assignee-email-modal">{assignee.email}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="detail-value-empty">Unassigned</span>
                  )}
                </div>

                {/* Due Date */}
                {task.dueDate && (
                  <div className="detail-item">
                    <span className="detail-label">
                      <Calendar size={14} />
                      Due Date
                    </span>
                    <span className="detail-value">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Time Tracking */}
                {(task.estimatedHours || task.actualHours) && (
                  <div className="detail-item">
                    <span className="detail-label">
                      <Clock size={14} />
                      Time
                    </span>
                    <div className="time-info">
                      {task.estimatedHours && (
                        <span>Est: {task.estimatedHours}h</span>
                      )}
                      {task.actualHours && (
                        <span>Actual: {task.actualHours}h</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Created */}
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Updated */}
                <div className="detail-item">
                  <span className="detail-label">Updated</span>
                  <span className="detail-value">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && task && (
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;