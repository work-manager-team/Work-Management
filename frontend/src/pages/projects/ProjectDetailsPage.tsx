import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, BarChart3, CheckCircle2, Clock } from 'lucide-react';
import projectService, { ProjectDetails } from '../../services/user/project.service';
import './ProjectDetailsPage.css';

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const details = await projectService.getProjectDetails(projectId!);
      setProject(details);
    } catch (err: any) {
      console.error('Error fetching project details:', err);
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'status-active';
    if (statusLower === 'completed') return 'status-completed';
    if (statusLower === 'on-hold' || statusLower === 'on hold') return 'status-on-hold';
    if (statusLower === 'archived') return 'status-archived';
    return 'status-default';
  };

  const getVisibilityColor = (visibility: string) => {
    const visibilityLower = visibility.toLowerCase();
    if (visibilityLower === 'public') return 'visibility-public';
    if (visibilityLower === 'private') return 'visibility-private';
    if (visibilityLower === 'team') return 'visibility-team';
    return 'visibility-default';
  };

  const calculateProgress = () => {
    if (!project || project.totalSprints === 0) return 0;
    return Math.round((project.completedSprints / project.totalSprints) * 100);
  };

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-details-page">
        <div className="error-container">
          <p className="error-message">{error || 'Project not found'}</p>
          <button onClick={() => navigate('/projects')} className="back-button">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="project-details-page">
      {/* Header */}
      <div className="details-header">
        <button onClick={() => navigate('/projects')} className="back-btn">
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </button>
      </div>

      {/* Project Info Card */}
      <div className="project-info-card">
        <div className="project-header">
          <div className="project-title-section">
            <div className="project-key-badge">{project.key}</div>
            <h1 className="project-title">{project.name}</h1>
          </div>
          <div className="project-badges">
            <span className={`status-badge ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className={`visibility-badge ${getVisibilityColor(project.visibility)}`}>
              {project.visibility}
            </span>
          </div>
        </div>

        {project.description && (
          <p className="project-description">{project.description}</p>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Members</p>
              <p className="stat-value">{project.memberCount}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Sprints</p>
              <p className="stat-value">{project.totalSprints}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Completed Sprints</p>
              <p className="stat-value">{project.completedSprints}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Progress</p>
              <p className="stat-value">{progress}%</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Sprint Progress</span>
            <span className="progress-text">
              {project.completedSprints} of {project.totalSprints} sprints completed
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Dates Section */}
        <div className="dates-section">
          <div className="date-item">
            <Calendar size={18} />
            <div>
              <p className="date-label">Start Date</p>
              <p className="date-value">{formatDate(project.startDate)}</p>
            </div>
          </div>

          <div className="date-item">
            <Calendar size={18} />
            <div>
              <p className="date-label">End Date</p>
              <p className="date-value">{formatDate(project.endDate)}</p>
            </div>
          </div>

          <div className="date-item">
            <Clock size={18} />
            <div>
              <p className="date-label">Created</p>
              <p className="date-value">{formatDate(project.createdAt)}</p>
            </div>
          </div>

          <div className="date-item">
            <Clock size={18} />
            <div>
              <p className="date-label">Last Updated</p>
              <p className="date-value">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="info-row">
            <span className="info-label">Project ID:</span>
            <span className="info-value">{project.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Owner ID:</span>
            <span className="info-value">{project.ownerId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;