import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, MoreVertical, ArrowUp, Folder } from 'lucide-react';
import projectService, { Project, ProjectDetails } from '../../services/user/project.service';
import ProjectMembersModal from './components/ProjectMembersModal';


interface ProjectWithDetails extends Project {
  memberCount?: number;
}

const ProjectsPage = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Modal state
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Get current user ID
  const currentUserId = localStorage.getItem('userId') || 1;
  useEffect(() => {
    fetchProjects();
    
    // Scroll event listener
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user's projects
      const userProjects = await projectService.getUserProjects(currentUserId);

      // Fetch member count for each project
      const projectsWithDetails = await Promise.all(
        userProjects.map(async (project) => {
          try {
            const details = await projectService.getProjectDetails(project.id);
            return {
              ...project,
              memberCount: details.memberCount,
            };
          } catch (err) {
            console.error(`Error fetching details for project ${project.id}:`, err);
            return {
              ...project,
              memberCount: 0,
            };
          }
        })
      );

      setProjects(projectsWithDetails);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };

  const handleShowMembers = (e: React.MouseEvent, projectId: number, projectName: string) => {
    e.stopPropagation(); // Prevent project card click
    setSelectedProjectForMembers({ id: projectId, name: projectName });
  };

  const handleCloseMembersModal = () => {
    setSelectedProjectForMembers(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'bg-green-500';
    if (statusLower === 'completed') return 'bg-blue-500';
    if (statusLower === 'on-hold' || statusLower === 'on hold') return 'bg-yellow-500';
    if (statusLower === 'archived') return 'bg-gray-500';
    return 'bg-gray-400';
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        {/* Header */}
                {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 ml-4">
              <Plus size={20} />
              <span>New Project</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="loading-spinner mb-4"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchProjects}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <>
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    >
                      {/* Project Header */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                              {project.key}
                            </span>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                              {project.name}
                            </h3>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {project.description || 'No description available'}
                        </p>
                      </div>

                      {/* Project Body */}
                      <div className="p-6">
                        {/* Status */}
                        <div className="mb-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Status
                          </span>
                          <p className="text-sm font-medium text-gray-800 capitalize mt-1">
                            {project.status}
                          </p>
                        </div>

                        {/* Visibility */}
                        <div className="mb-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Visibility
                          </span>
                          <p className="text-sm font-medium text-gray-800 capitalize mt-1">
                            {project.visibility}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users size={16} />
                            <span>{project.memberCount || 0} members</span>
                          </div>
                          <button
                            onClick={(e) => handleShowMembers(e, project.id, project.name)}
                            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                          >
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Folder size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search criteria' : 'Create your first project to get started'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}

      {/* Members Modal */}
      {selectedProjectForMembers && (
        <ProjectMembersModal
          projectId={selectedProjectForMembers.id}
          projectName={selectedProjectForMembers.name}
          onClose={handleCloseMembersModal}
        />
      )}
    </div>
  );
};

export default ProjectsPage;