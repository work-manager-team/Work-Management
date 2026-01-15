import React, { useEffect, useState } from 'react';
import { X, Calendar, Users, BarChart3, CheckCircle2, Clock } from 'lucide-react';
import projectService, { ProjectDetails } from '../../../services/user/project.service';
import './ProjectDetailsModal.css';

interface ProjectDetailsModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectDetails();
    }
  }, [isOpen, projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const details = await projectService.getProjectDetails(projectId);
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
    if (statusLower === 'active') return '#10b981';
    if (statusLower === 'completed') return '#3b82f6';
    if (statusLower === 'on-hold' || statusLower === 'on hold') return '#f59e0b';
    if (statusLower === 'archived') return '#6b7280';
    return '#6b7280';
  };

  const getVisibilityColor = (visibility: string) => {
    const visibilityLower = visibility.toLowerCase();
    if (visibilityLower === 'public') return '#8b5cf6';
    if (visibilityLower === 'private') return '#ef4444';
    if (visibilityLower === 'team') return '#06b6d4';
    return '#6b7280';
  };

  const calculateProgress = () => {
    if (!project || project.totalSprints === 0) return 0;
    return Math.round((project.completedSprints / project.totalSprints) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="project-details-modal-overlay" onClick={onClose}>
      <div className="project-details-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Project Details</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="modal-loading">
            <div className="loading-spinner"></div>
            <p>Loading project details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="modal-error">
            <p>{error}</p>
            <button onClick={fetchProjectDetails} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && project && (
          <div className="modal-body">
            {/* Project Title */}
            <div className="project-header-section">
              <div>
                <div className="project-key-badge">{project.key}</div>
                <h3 className="project-title">{project.name}</h3>
              </div>
              <div className="project-badges">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: `${getStatusColor(project.status)}20`, color: getStatusColor(project.status) }}
                >
                  {project.status
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')}
                </span>
                <span 
                  className="visibility-badge"
                  style={{ backgroundColor: `${getVisibilityColor(project.visibility)}20`, color: getVisibilityColor(project.visibility) }}
                >
                  {project.visibility}
                </span>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="section">
                <h4 className="section-title">Description</h4>
                <p className="description">{project.description}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <Users size={20} />
                <div>
                  <p className="stat-label">Members</p>
                  <p className="stat-value">{project.memberCount}</p>
                </div>
              </div>

              <div className="stat-card">
                <BarChart3 size={20} />
                <div>
                  <p className="stat-label">Sprints</p>
                  <p className="stat-value">{project.totalSprints}</p>
                </div>
              </div>

              <div className="stat-card">
                <CheckCircle2 size={20} />
                <div>
                  <p className="stat-label">Completed</p>
                  <p className="stat-value">{project.completedSprints}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {project.totalSprints > 0 && (
              <div className="section">
                <h4 className="section-title">Progress</h4>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${calculateProgress()}%` }}></div>
                  </div>
                  <p className="progress-text">{calculateProgress()}% completed</p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="dates-section">
              <div className="date-item">
                <Calendar size={16} />
                <div>
                  <p className="date-label">Start Date</p>
                  <p className="date-value">{formatDate(project.startDate)}</p>
                </div>
              </div>

              <div className="date-item">
                <Clock size={16} />
                <div>
                  <p className="date-label">End Date</p>
                  <p className="date-value">{formatDate(project.endDate)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
