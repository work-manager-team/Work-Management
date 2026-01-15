import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Search, Plus, Users, MoreVertical, ArrowUp, Folder, Filter, Star } from 'lucide-react';
import projectService, { Project, ProjectDetails } from '../../services/user/project.service';
import recentActivityService from '../../services/user/recentActivity.service';
import starredService from '../../services/user/starred.service';
import ProjectMembersModal from './components/ProjectMembersModal';
import CreateProjectModal from './components/CreateProjectModal';

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
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'my'>('all');
  const [projectCount, setProjectCount] = useState<{ all: number; my: number }>({ 
    all: 0, 
    my: 0 
  });
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<{
    id: number;
    name: string;
  } | null>(null);
  
  const [starredProjects, setStarredProjects] = useState<Set<string>>(new Set());
  
  const user = localStorage.getItem('user');
  const currentUserId = user ? JSON.parse(user).id : null;
  
  useEffect(() => {
    fetchProjects();
    loadStarredProjects();
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 3);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filterType]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getCountProjects = async (): Promise<number> => {
    try {
      const response = await fetch('https://work-management-chi.vercel.app/projects/count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project count: ${response.statusText}`);
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error in getCountProjects:', error);
      throw error;
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      let allProjects: Project[] = [];

      if (filterType === 'my') {
        allProjects = await projectService.getUserProjects(currentUserId);
        setProjectCount(prev => ({ ...prev, my: allProjects.length }));
      } else {
        const count = await getCountProjects();
        const maxAttempts = count * 2;
        const projectPromises = [];

        for (let i = 1; i <= maxAttempts; i++) {
          projectPromises.push(
            projectService.getAllProjects(i).catch(err => {
              console.error(`Error fetching project ${i}:`, err);
              return null;
            })
          );
        }

        const projectResults = await Promise.all(projectPromises);
        const allFetchedProjects = projectResults
          .filter(p => p !== null)
          .flat() as Project[];
          
        const userProjects = await projectService.getUserProjects(currentUserId);
        const userProjectIds = new Set(userProjects.map(p => p.id));

        allProjects = allFetchedProjects.filter(project => {
          const isPublic = project.visibility.toLowerCase() === 'public';
          const isTeam = project.visibility.toLowerCase() === 'team';
          const isMember = userProjectIds.has(project.id);
          return isPublic || isMember || isTeam;
        });
        
        setProjectCount(prev => ({ ...prev, all: allProjects.length }));
        
        if (allProjects.length < count) {
          console.warn(`Expected ${count} projects but only found ${allProjects.length}`);
        }
      }

      const projectsWithDetails = await Promise.all(
        allProjects.map(async (project) => {
          try {
            const members = await projectService.getProjectMembers(project.id);
            
            const activeMemberCount = members.filter((member: any) => 
              member.status?.toLowerCase() === 'active' && 
              (member.role?.toLowerCase() === 'member' || member.role?.toLowerCase() === 'admin' || member.role?.toLowerCase() === 'viewer')
            ).length;
            
            return {
              ...project,
              memberCount: activeMemberCount,
            };
          } catch (err) {
            console.error(`Error fetching members for project ${project.id}:`, err);
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
    const project = projects.find(p => p.id === projectId);
    if (project) {
      recentActivityService.trackProjectView({
        id: projectId.toString(),
        name: project.name,
        description: project.description,
      }, 'view-detail');
    }
    navigate(`/projects/${projectId}`);
  };

  const handleShowMembers = (e: React.MouseEvent, projectId: number, projectName: string) => {
    e.stopPropagation();
    
    recentActivityService.trackProjectView({
      id: projectId.toString(),
      name: projectName,
    }, 'view-members');
    
    setSelectedProjectForMembers({ id: projectId, name: projectName });
  };

  const handleCloseMembersModal = () => {
    setSelectedProjectForMembers(null);
  };
  
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const loadStarredProjects = () => {
    const starred = starredService.getStarredProjects();
    const starredIds = new Set(starred.map(p => p.id));
    setStarredProjects(starredIds);
  };

  const handleToggleStar = (e: React.MouseEvent, project: ProjectWithDetails) => {
    e.stopPropagation();
    
    const isStarred = starredService.toggleProjectStar({
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      key: project.key,
      status: project.status,
      visibility: project.visibility
    });
    
    setStarredProjects(prev => {
      const newSet = new Set(prev);
      if (isStarred) {
        newSet.add(project.id.toString());
      } else {
        newSet.delete(project.id.toString());
      }
      return newSet;
    });
  };
  
  const handleFilterChange = (type: 'all' | 'my') => {
    setFilterType(type);
    setShowFilterMenu(false);
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
  
  const currentCount = filterType === 'all' ? projectCount.all : projectCount.my;
  
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-6">
          {/* Search Bar with Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                    filterType === 'my'
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={20} />
                  <span>{filterType === 'all' ? 'All Projects' : 'My Projects'}</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    filterType === 'my'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {currentCount}
                  </span>
                </button>

                {showFilterMenu && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                    <button
                      onClick={() => handleFilterChange('all')}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        filterType === 'all' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      All Projects
                    </button>
                    <button
                      onClick={() => handleFilterChange('my')}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                        filterType === 'my' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      My Projects
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleOpenCreateModal}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 ml-4"
            >
              <Plus size={20} />
              <span>New Project</span>
            </button>
          </div>

          {/* ✅ UPDATED: Loading State với Loader icon */}
          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center justify-center">
              <Loader size={48} className="text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">
                Loading {filterType === 'my' ? 'your' : 'all'} projects...
              </p>
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
                          <div className="flex items-center gap-2 flex-1">
                            <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                              {project.key}
                            </span>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                              {project.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleToggleStar(e, project)}
                              className={`p-1.5 rounded-full transition-all ${
                                starredProjects.has(project.id.toString())
                                  ? 'text-yellow-500 hover:text-yellow-600'
                                  : 'text-gray-400 hover:text-yellow-500'
                              }`}
                              aria-label={starredProjects.has(project.id.toString()) ? 'Unstar project' : 'Star project'}
                            >
                              <Star 
                                size={18} 
                                fill={starredProjects.has(project.id.toString()) ? 'currentColor' : 'none'}
                              />
                            </button>
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {project.description || 'No description available'}
                        </p>
                      </div>

                      {/* Project Body */}
                      <div className="p-6">
                        <div className="mb-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Status
                          </span>
                          <p className="text-sm font-medium text-gray-800 capitalize mt-1">
                            {project.status.split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ')}
                          </p>
                        </div>

                        <div className="mb-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Visibility
                          </span>
                          <p className="text-sm font-medium text-gray-800 capitalize mt-1">
                            {project.visibility}
                          </p>
                        </div>

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
                    {searchQuery 
                      ? 'Try adjusting your search criteria' 
                      : filterType === 'my'
                      ? 'You are not a member of any projects yet'
                      : 'No projects available in the system'}
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

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={handleCloseCreateModal}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default ProjectsPage;