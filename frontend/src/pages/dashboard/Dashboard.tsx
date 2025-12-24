import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';

// Import components
import ProjectCard from './components/ProjectCard';
import RecentWorkItems from './components/RecentWorkItems';
import ProjectsModal from './components/ProjectsModal';

// Import services
import projectService from '../../services/user/project.service';
import taskService from '../../services/user/task.service';

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
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);

  // Get current user ID
  const currentUserId = localStorage.getItem('userId') || '2';

  // Fetch projects on mount
  useEffect(() => {
    fetchUserProjects();
  }, [currentUserId]);

  const fetchUserProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await projectService.getUserProjects(currentUserId);
      const projectsData = Array.isArray(response) ? response : (response.data || []);
      setProjects(projectsData);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch assigned tasks for current user
  const fetchAssignedTasks = async (): Promise<Task[]> => {
    try {
      // Call API: GET /tasks/assignee/:userId
      const tasksData = await taskService.getAssignedTasks(currentUserId);
      
      // Transform API response to match modal format
      const formattedTasks = tasksData.map((task: any) => ({
        id: task.id?.toString() || '',
        title: task.title || 'Untitled Task',
        description: task.description || '',
        status: task.status || 'todo',
        projectId: task.projectId?.toString() || '',
        projectName: '', // Có thể fetch project name nếu cần
        priority: task.priority || '',
        type: task.type || '',
        dueDate: task.dueDate || null
      }));

      return formattedTasks;
    } catch (err: any) {
      console.error('Error fetching assigned tasks:', err);
      return [];
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
    navigate(`/project/${projectId}/board`);
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  // Limit to 3 projects for dashboard display
  const displayedProjects = projects.slice(0, 3);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">For you</h1>
      </div>

      {/* Your Spaces Section */}
      <section className="spaces-section">
        <div className="section-header">
          <h2 className="section-title">Recent spaces</h2>
          <button 
            onClick={handleViewAllProjects}
            className="view-all-button"
          >
            View all spaces
            <ChevronRight size={16} />
          </button>
        </div>

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

        {/* Projects Grid - 3 columns */}
        {!loading && !error && (
          <>
            {displayedProjects.length > 0 ? (
              <div className="projects-grid">
                {displayedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📁</div>
                <h3>No spaces yet</h3>
                <p>Create your first project to get started</p>
                <button 
                  onClick={handleCreateProject}
                  className="create-project-button"
                >
                  <Plus size={18} />
                  Create Project
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Work Items Tabs */}
      <section className="work-items-section">
        <RecentWorkItems 
          userId={currentUserId}
          onViewAssignedTasks={fetchAssignedTasks}
        />
      </section>

      {/* All Projects Modal */}
      {showAllProjects && (
        <ProjectsModal
          projects={projects}
          onClose={handleCloseModal}
          onProjectClick={handleProjectClick}
        />
      )}
    </div>
  );
};

export default Dashboard;