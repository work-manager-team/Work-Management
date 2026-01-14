import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { apiCall } from '../../utils/api';

interface AssigneeInfo {
  id: string;
  name: string;
  email?: string;
  [key: string]: any;
}

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    assigneeId?: string;
  };
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [assignee, setAssignee] = useState<AssigneeInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task.assigneeId) {
      fetchAssignee(task.assigneeId);
    }
  }, [task.assigneeId]);

  const fetchAssignee = async (assigneeId: string) => {
    try {
      setLoading(true);
      const response = await apiCall(
        `https://work-management-chi.vercel.app/users/${assigneeId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch assignee');
      }

      const data = await response.json();
      setAssignee(data);
    } catch (error) {
      console.error('Error fetching assignee:', error);
      setAssignee(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-card">
      <p className="task-title">{task.title}</p>
      {task.description && <p className="task-description">{task.description}</p>}
      {task.assigneeId && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader size={14} className="animate-spin text-gray-400" />
              <span className="text-xs text-gray-500">Loading assignee...</span>
            </div>
          ) : assignee ? (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Assigned to:</span> {assignee.name}
              {assignee.email && <span className="block text-gray-500">{assignee.email}</span>}
            </div>
          ) : (
            <span className="text-xs text-gray-500">Assignee not found</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;