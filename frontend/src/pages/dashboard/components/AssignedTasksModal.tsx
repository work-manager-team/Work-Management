import React from 'react';
import { X } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  projectId: string;
  projectName?: string;
}

interface AssignedTasksModalProps {
  tasks: Task[];
  loading: boolean;
  onClose: () => void;
}

const AssignedTasksModal: React.FC<AssignedTasksModalProps> = ({
  tasks,
  loading,
  onClose,
}) => {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assigned-tasks-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Tasks Assigned to Me</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No tasks assigned</h3>
              <p>You don't have any tasks assigned to you yet</p>
            </div>
          ) : (
            <div className="tasks-table-container">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Project</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
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
                      <td className="task-project">{task.projectName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && tasks.length > 0 && (
          <div className="modal-footer">
            <p className="tasks-count">Total: {tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedTasksModal;