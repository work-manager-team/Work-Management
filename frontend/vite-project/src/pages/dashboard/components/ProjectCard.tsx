import React from 'react';
import { Users, Calendar, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Project } from '../../../models/Project';
import './projectCard.css';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const handleQuickLinksClick = (e: React.MouseEvent, link: string) => {
    e.stopPropagation(); // Prevent card click
    console.log('Navigate to:', link);
  };

  return (
    <div className="project-card" onClick={onClick}>
      {/* Project Header */}
      <div className="project-card-header">
        <div className="project-icon">
          {project.avatar ? (
            <img src={project.avatar} alt={project.name} />
          ) : (
            <span>{project.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="project-info">
          <h3 className="project-name">{project.name}</h3>
          <p className="project-type">{project.type || 'Team-managed software'}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="project-quick-links">
        <h4 className="quick-links-title">Quick links</h4>
        
        <button 
          className="quick-link"
          onClick={(e) => handleQuickLinksClick(e, 'open-work')}
        >
          <span>My open work items</span>
          <span className="quick-link-count">{project.openWorkItems || 0}</span>
        </button>

        <button 
          className="quick-link"
          onClick={(e) => handleQuickLinksClick(e, 'done-work')}
        >
          <span>Done work items</span>
        </button>
      </div>

      {/* Boards Dropdown */}
      <button className="project-boards-dropdown">
        <span>{project.boardsCount || 1} board</span>
        <ChevronDown size={16} />
      </button>
    </div>
  );
};

export default ProjectCard;