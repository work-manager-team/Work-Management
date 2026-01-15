import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Project } from '../../../models/Project';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onViewDetail?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onViewDetail }) => {
  const handleQuickLinksClick = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    console.log('Navigate to:', link);
  };

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetail?.();
  };

  return (
    <div className="project-card" onClick={onClick}>
      {/* Project Header */}
      <div className="project-card-header">
        
        <div className="project-info">
          <h3 className="project-name">{project.name}</h3>
          <p className="project-type">{project.key || 'Team-managed software'}</p>
        </div>
      </div>

      {/* Status Badge */}
      {project.status && (
        <div className="project-status-badge">
          <span className={`status-dot status-${project.status.toLowerCase()}`}></span>
          <span className="status-text">{project.status}</span>
        </div>
      )}

      {/* Description Tooltip - Show on hover */}
      {project.description && (
        <div className="project-description-tooltip">
          <p>{project.description}</p>
        </div>
      )}

      {/* View Detail Link */}
      <div className="project-card-footer">
        <button 
          className="view-detail-link"
          onClick={handleViewDetail}
          title="View project details"
        >
          View detail
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;