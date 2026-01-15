import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, BarChart3, CheckCircle2, Clock, Settings, X, ExternalLink } from 'lucide-react';
import projectService, { ProjectDetails } from '../../services/user/project.service';
import './ProjectDetailsPage.css';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import ProjectMembersModal from './components/ProjectMembersModal';
import recentActivityService from '../../services/user/recentActivity.service';

interface Sprint {
  id: number;
  projectId: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  // Sprint modal states
  const [showSprintsModal, setShowSprintsModal] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [sprintFilter, setSprintFilter] = useState<'all' | 'completed'>('all');

  // Get event type from navigation state
  const eventType = (location.state as any)?.eventType || 'view-detail';

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  // Open appropriate modal based on event type
  useEffect(() => {
    if (project && eventType) {
      if (eventType === 'view-members') {
        setShowMembersModal(true);
      }
    }
  }, [project, eventType]);

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

  const fetchSprints = async (filter: 'all' | 'completed' = 'all') => {
    setLoadingSprints(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
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
      
      // Filter sprints based on status
      let filteredSprints = data;
      if (filter === 'completed') {
        filteredSprints = data.filter((sprint: Sprint) => 
          sprint.status.toLowerCase() === 'completed'
        );
      }
      
      setSprints(filteredSprints);
    } catch (err) {
      console.error('Error fetching sprints:', err);
      setSprints([]);
    } finally {
      setLoadingSprints(false);
    }
  };

  const handleOpenSprintsModal = (filter: 'all' | 'completed' = 'all') => {
    setSprintFilter(filter);
    setShowSprintsModal(true);
    fetchSprints(filter);
  };

  const handleOpenMembersModal = () => {
    setShowMembersModal(true);
  };

  const handleNavigateToCalendar = (sprint: Sprint) => {
    // Navigate to calendar with project and month info
    const sprintMonth = new Date(sprint.startDate);
    
    navigate('/calendar', {
      state: {
        projectId: projectId,
        selectedMonth: sprintMonth.toISOString(),
        sprintId: sprint.id,
      }
    });
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

  const getSprintStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'planned') return '#6366f1';
    if (statusLower === 'active') return '#0ea5e9';
    if (statusLower === 'completed') return '#10b981';
    if (statusLower === 'cancelled') return '#ef4444';
    return '#6b7280';
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
  
  const handleUpdateProject = (updatedProject: ProjectDetails) => {
    setProject(updatedProject);
    fetchProjectDetails();
  };

  const handleDeleteProject = () => {
    navigate('/projects');
  };

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
              {project.status
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')}
            </span>
            <span className={`visibility-badge ${getVisibilityColor(project.visibility)}`}>
              {project.visibility}
            </span>
            <button 
              className="project-settings-button"
              onClick={() => setShowSettingsModal(true)}
              title="Project Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {project.description && (
          <p className="project-description">{project.description}</p>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div 
            className="stat-card clickable"
            onClick={handleOpenMembersModal}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Members</p>
              <p className="stat-value">{project.memberCount}</p>
            </div>
          </div>

          <div 
            className="stat-card clickable"
            onClick={() => handleOpenSprintsModal('all')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Sprints</p>
              <p className="stat-value">{project.totalSprints}</p>
            </div>
          </div>

          <div 
            className="stat-card clickable"
            onClick={() => handleOpenSprintsModal('completed')}
            style={{ cursor: 'pointer' }}
          >
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

        {/* Project Settings Modal */}
        {showSettingsModal && (
          <ProjectSettingsModal
            project={project}
            onClose={() => setShowSettingsModal(false)}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
          />
        )}

        {/* Project Members Modal */}
        {showMembersModal && (
          <ProjectMembersModal
            projectId={project.id as unknown as number}
            projectName={project.name}
            onClose={() => setShowMembersModal(false)}
          />
        )}

        {/* Sprints Modal */}
        {showSprintsModal && (
          <div className="modal-overlay" onClick={() => setShowSprintsModal(false)}>
            <div 
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '800px', maxHeight: '80vh' }}
            >
              {/* Header */}
              <div className="modal-header">
                <h2>{sprintFilter === 'completed' ? 'Completed Sprints' : 'All Sprints'}</h2>
                <button 
                  className="close-button" 
                  onClick={() => setShowSprintsModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="modal-body" style={{ overflowY: 'auto' }}>
                {loadingSprints ? (
                  <div className="loading-container" style={{ padding: '40px' }}>
                    <div className="loading-spinner"></div>
                    <p>Loading sprints...</p>
                  </div>
                ) : sprints.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px' }}>
                    <BarChart3 size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <h3>No sprints found</h3>
                    <p>
                      {sprintFilter === 'completed' 
                        ? 'No completed sprints yet' 
                        : 'This project has no sprints yet'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sprints.map((sprint) => (
                      <div
                        key={sprint.id}
                        style={{
                          padding: '16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          backgroundColor: '#f9fafb',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ 
                              fontSize: '16px', 
                              fontWeight: 600, 
                              color: '#111827',
                              marginBottom: '4px'
                            }}>
                              {sprint.name}
                            </h3>
                            {sprint.goal && (
                              <p style={{ 
                                fontSize: '14px', 
                                color: '#6b7280',
                                marginBottom: '8px'
                              }}>
                                {sprint.goal}
                              </p>
                            )}
                          </div>
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              backgroundColor: `${getSprintStatusColor(sprint.status)}20`,
                              color: getSprintStatusColor(sprint.status),
                            }}
                          >
                            {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                          </span>
                        </div>

                        <div style={{ 
                          display: 'flex', 
                          gap: '24px',
                          fontSize: '13px',
                          color: '#6b7280',
                          marginBottom: '8px'
                        }}>
                          <div>
                            <strong>Start:</strong> {formatDate(sprint.startDate)}
                          </div>
                          <div>
                            <strong>End:</strong> {formatDate(sprint.endDate)}
                          </div>
                        </div>

                        <button
                          onClick={() => handleNavigateToCalendar(sprint)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#2563eb',
                            backgroundColor: 'transparent',
                            border: '1px solid #2563eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#2563eb';
                          }}
                        >
                          <ExternalLink size={14} />
                          View in Calendar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loadingSprints && sprints.length > 0 && (
                <div className="modal-footer">
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Total: {sprints.length} sprint{sprints.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;