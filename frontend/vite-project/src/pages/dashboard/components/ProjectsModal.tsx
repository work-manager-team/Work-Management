import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { Project } from '../../../models/Project';
import './projectsModal.css';

interface ProjectsModalProps {
  projects: Project[];
  onClose: () => void;
  onProjectClick: (projectId: string) => void;
}

const ProjectsModal: React.FC<ProjectsModalProps> = ({ 
  projects, 
  onClose, 
  onProjectClick 
}) => {
  const ITEMS_PER_PAGE = 15; // 3 columns x 5 rows
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="projects-modal-backdrop" onClick={handleBackdropClick}>
      <div className="projects-modal">
        {/* Modal Header */}
        <div className="projects-modal-header">
          <h2 className="projects-modal-title">All Projects</h2>
          <button 
            onClick={onClose}
            className="projects-modal-close"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="projects-modal-content">
          {currentProjects.length > 0 ? (
            <div className="projects-modal-grid">
              {currentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => {
                    onProjectClick(project.id);
                    onClose();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="projects-modal-empty">
              <p>No projects found</p>
            </div>
          )}
        </div>

        {/* Modal Footer - Pagination */}
        {totalPages > 1 && (
          <div className="projects-modal-footer">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="pagination-info">
              <span className="pagination-current">Page {currentPage}</span>
              <span className="pagination-separator">/</span>
              <span className="pagination-total">{totalPages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsModal;

