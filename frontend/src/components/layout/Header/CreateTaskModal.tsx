import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import projectService from '../../../services/user/project.service';
import taskService from '../../../services/user/task.service';
import './CreateTaskModal.css';

interface Sprint {
  id: number;
  name: string;
  projectId: number;
}

interface ProjectMember {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

interface UserDetail {
  id: number;
  fullName: string;
  email: string;
  // Thêm các field khác nếu cần
}

interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  ownerId: string;
  status: string;
  visibility: string;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
  userRole?: string;
}

interface CreateTaskModalProps {
  onClose: () => void;
  onTaskCreated?: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  projectId: string | '';
  sprintId: number | '';
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId: number | '';
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    projectId: '',
    sprintId: '',
    status: 'todo',
    priority: 'medium',
    assigneeId: '',
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID
  const user = localStorage.getItem('user');
  const currentUserId = user ? JSON.parse(user).id : null;
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.projectId) {
      fetchSprints(formData.projectId);
      fetchMembers(formData.projectId);
    }
  }, [formData.projectId]);

  // Hàm kiểm tra role của user trong project
  const checkUserRoleInProject = async (projectId: string, userId: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://work-management-chi.vercel.app/projects/${projectId}/users/${userId}/role`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch role for project ${projectId}`);
        return null;
      }

      const data = await response.json();
      // API có thể trả về { role: "admin" } hoặc trực tiếp string "admin"
      return typeof data === 'string' ? data : data.role;
    } catch (err) {
      console.error(`Error checking role for project ${projectId}:`, err);
      return null;
    }
  };

  // Hàm lấy thông tin user từ API /users/{userId}
  const fetchUserDetails = async (userId: number): Promise<UserDetail | null> => {
    try {
      const response = await fetch(
        `https://work-management-chi.vercel.app/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch user details for userId ${userId}`);
        return null;
      }

      const userData = await response.json();
      return userData;
    } catch (err) {
      console.error(`Error fetching user details for userId ${userId}:`, err);
      return null;
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách projects của user
      const projectsData = await projectService.getUserProjects(currentUserId);
      
      console.log('📦 Raw projects data:', projectsData);
      
      if (!Array.isArray(projectsData) || projectsData.length === 0) {
        setProjects([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Filter projects có status active hoặc planning
      const activeProjects = projectsData.filter((project: any) => 
        project.status === 'active' || project.status === 'planning'
      );

      console.log('✅ Active projects:', activeProjects);

      // Check role của user cho từng project (gọi song song để tối ưu performance)
      const projectsWithRoleChecks = await Promise.all(
        activeProjects.map(async (project: any) => {
          const role = await checkUserRoleInProject(project.id, currentUserId);
          console.log(`Project ${project.name} (${project.id}): role = ${role}`);
          return {
            ...project,
            userRole: role,
          };
        })
      );

      // Chỉ giữ lại projects mà user có role là admin
      const adminProjects = projectsWithRoleChecks.filter(
        (project) => project.userRole?.toLowerCase() === 'admin'
      );

      console.log('👑 Admin projects:', adminProjects);
      
      setProjects(adminProjects);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSprints = async (projectId: string) => {
    try {
      const response = await fetch(
        `https://work-management-chi.vercel.app/sprints?projectId=${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sprints');
      }

      const data = await response.json();
      setSprints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching sprints:', err);
      setSprints([]);
    }
  };

  const fetchMembers = async (projectId: string) => {
    try {
      // Bước 1: Lấy danh sách members từ API
      const response = await fetch(
        `https://work-management-chi.vercel.app/projects/${projectId}/members/active`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const membersData = await response.json();
      
      if (!Array.isArray(membersData) || membersData.length === 0) {
        setMembers([]);
        return;
      }

      console.log('👥 Raw members data:', membersData);

      // Bước 2: Lấy thông tin chi tiết của từng user từ API /users/{userId}
      const membersWithDetails = await Promise.all(
        membersData.map(async (member: any) => {
          const userDetails = await fetchUserDetails(member.userId);
          
          if (userDetails) {
            return {
              id: member.id,
              userId: member.userId,
              fullName: userDetails.fullName,
              email: userDetails.email,
              role: member.role,
            };
          } else {
            // Nếu không lấy được user details, giữ nguyên dữ liệu cũ (nếu có)
            return {
              id: member.id,
              userId: member.userId,
              fullName: member.fullName || 'Unknown User',
              email: member.email || '',
              role: member.role,
            };
          }
        })
      );

      console.log('✅ Members with user details:', membersWithDetails);
      setMembers(membersWithDetails);
    } catch (err) {
      console.error('Error fetching members:', err);
      setMembers([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sprintId' || name === 'assigneeId' 
        ? (value ? Number(value) : '')
        : value, // projectId giữ nguyên là string
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!formData.projectId) {
      setError('Please select a project');
      return;
    }

    if (!formData.sprintId) {
      setError('Please select a sprint');
      return;
    }

    if (!formData.assigneeId) {
      setError('Please select an assignee');
      return;
    }

    setSubmitting(true);

    try {
      const taskPayload = {
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId, // string
        sprintId: formData.sprintId, // number
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId, // number
      };

      console.log('📤 Sending task payload:', taskPayload);

      const response = await fetch('https://work-management-chi.vercel.app/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(taskPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const createdTask = await response.json();
      console.log('✅ Task created:', createdTask);

      onTaskCreated?.();
      onClose();
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content create-task-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>Create Task</h2>
          <button className="close-button" onClick={onClose} disabled={submitting}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="create-task-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectId">Project *</label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleInputChange}
                required
                disabled={submitting || loading}
              >
                <option value="">
                  {loading ? 'Loading projects...' : 'Select a project'}
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.key} - {project.name}
                  </option>
                ))}
              </select>
              {!loading && projects.length === 0 && (
                <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  No projects available. You need admin role to create tasks.
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sprintId">Sprint *</label>
              <select
                id="sprintId"
                name="sprintId"
                value={formData.sprintId}
                onChange={handleInputChange}
                required
                disabled={submitting || !formData.projectId}
              >
                <option value="">Select a sprint</option>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={submitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="assigneeId">Assignee *</label>
            <select
              id="assigneeId"
              name="assigneeId"
              value={formData.assigneeId}
              onChange={handleInputChange}
              required
              disabled={submitting || !formData.projectId}
            >
              <option value="">Select a team member</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.fullName} ({member.email})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;