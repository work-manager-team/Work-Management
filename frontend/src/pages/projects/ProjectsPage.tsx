import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Search, Plus, Users, MoreVertical, ArrowUp, Folder, Filter, Star, Mail, X, Check, XCircle, Clock, AlertCircle } from 'lucide-react';
import projectService, { Project, ProjectDetails } from '../../services/user/project.service';
import recentActivityService from '../../services/user/recentActivity.service';
import starredService from '../../services/user/starred.service';
import ProjectMembersModal from './components/ProjectMembersModal';
import CreateProjectModal from './components/CreateProjectModal';
import './components/InvitationsModal.css';

interface Invitation {
  id: number;
  role: string;
  invitedAt: string;
  project: {
    id: number;
    name: string;
    key: string;
    description: string;
    status: string;
    visibility: string;
  };
  invitedBy: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    avatarUrl: string;
  };
}

const ProjectsPage = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'my'>('all');
  const [filterInitialized, setFilterInitialized] = useState(true);
  const [projectCount, setProjectCount] = useState<{ all: number; my: number }>({ 
    all: 0, 
    my: 0 
  });
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // ✅ Ref cho scroll container
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // ✅ Invitations state
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);
  const [invitationsProcessing, setInvitationsProcessing] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | null>(null);
  
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<{
    id: number;
    name: string;
  } | null>(null);
  
  const [starredProjects, setStarredProjects] = useState<Set<string>>(new Set());
  
  const user = localStorage.getItem('user');
  const currentUserId = user ? JSON.parse(user).id : null;
  
  // ✅ Track if already fetched to prevent double calls
  const hasFetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // ✅ Fetch invitations count
  const fetchInvitationsCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://work-management-chi.vercel.app/projects/my-invitations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
        setInvitationsCount(count);
      }
    } catch (err) {
      console.error('Error fetching invitations count:', err);
    }
  }, []);
  
  const fetchInvitations = useCallback(async () => {
    setInvitationsLoading(true);
    setInvitationsError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://work-management-chi.vercel.app/projects/my-invitations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        setInvitationsError('Your session has expired. Please refresh the page.');
        setInvitationsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setInvitations(data);
      } else if (data && typeof data === 'object') {
        setInvitations([data]);
      } else {
        setInvitations([]);
      }
    } catch (err: any) {
      console.error('Error fetching invitations:', err);
      setInvitationsError(err.message || 'Failed to load invitations');
      setInvitations([]);
    } finally {
      setInvitationsLoading(false);
    }
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };
  
  const handleInvitationClick = (invitationId: number) => {
    if (selectedInvitationId === invitationId) {
      setSelectedInvitationId(null);
      setSelectedAction(null);
    } else {
      setSelectedInvitationId(invitationId);
      setSelectedAction(null);
    }
  };

  const handleActionChange = (action: 'accept' | 'reject') => {
    setSelectedAction(action);
  };

  const handleConfirmInvitation = async () => {
    if (!selectedInvitationId || !selectedAction) {
      setInvitationsError('Please select an action (Accept or Reject)');
      return;
    }

    setInvitationsProcessing(true);
    setInvitationsError(null);

    try {
      const endpoint = selectedAction === 'accept' 
        ? `https://work-management-chi.vercel.app/project-invitations/${selectedInvitationId}/accept`
        : `https://work-management-chi.vercel.app/project-invitations/${selectedInvitationId}/reject`;

      const token = localStorage.getItem('accessToken');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        setInvitationsError('Your session has expired. Please refresh the page.');
        setInvitationsProcessing(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to ${selectedAction} invitation`);
      }

      setInvitations(prev => prev.filter(inv => inv.id !== selectedInvitationId));
      setSelectedInvitationId(null);
      setSelectedAction(null);

      fetchProjects();
      fetchInvitationsCount();

      if (invitations.length === 1) {
        setTimeout(() => setShowInvitationsModal(false), 500);
      }
    } catch (err: any) {
      console.error(`Error ${selectedAction}ing invitation:`, err);
      setInvitationsError(err.message || `Failed to ${selectedAction} invitation. Please try again.`);
    } finally {
      setInvitationsProcessing(false);
    }
  };
  
  // ✅ Simplified: Only fetch projects list, NO member count
  const fetchProjects = async () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      
      let url = 'https://work-management-chi.vercel.app/projects';
      if (filterType === 'my') {
        url = `https://work-management-chi.vercel.app/projects?userId=${currentUserId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const allProjects = await response.json();
      
      // Update project count
      if (filterType === 'my') {
        setProjectCount(prev => ({ ...prev, my: allProjects.length }));
      } else {
        setProjectCount(prev => ({ ...prev, all: allProjects.length }));
      }

      // Only update if not aborted
      if (!signal.aborted) {
        setProjects(allProjects);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Failed to load projects');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };
  
  const loadStarredProjects = useCallback(() => {
    const starred = starredService.getStarredProjects();
    const starredIds = new Set(starred.map(p => p.id));
    setStarredProjects(starredIds);
  }, []);
  
  // ✅ Simplified useEffect with proper cleanup
  useEffect(() => {
    // Prevent double fetch in development (React.StrictMode)
    if (hasFetchedRef.current) return;
    
    if (filterInitialized) {
      hasFetchedRef.current = true;
      fetchProjects();
    }
    
    loadStarredProjects();
    fetchInvitationsCount();
    
    if (sessionStorage.getItem('authExpired')) {
      sessionStorage.removeItem('authExpired');
      setError('Your session has expired. Please login again.');
    }
    
    // ✅ Cleanup function
    return () => {
      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Reset fetch flag when filter changes
      hasFetchedRef.current = false;
    };
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
    hasFetchedRef.current = false;
    fetchProjects();
  };
  
  const handleOpenInvitationsModal = async () => {
    setShowInvitationsModal(true);
    setInvitationsLoading(true);
    await fetchInvitations();
  };

  const handleCloseInvitationsModal = () => {
    setShowInvitationsModal(false);
  };

  const scrollToTop = () => {
    // ✅ Scroll container thay vì window
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleToggleStar = (e: React.MouseEvent, project: Project) => {
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
    setFilterInitialized(true);
    setShowFilterMenu(false);
    hasFetchedRef.current = false;
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
        <div ref={scrollContainerRef} className="flex-1 overflow-auto p-6">{/* ✅ Added ref */}
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

            <div className="flex items-center gap-3 ml-4">
              <button 
                onClick={handleOpenInvitationsModal}
                className="relative bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Mail size={20} />
                <span>Invitations</span>
                {invitationsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {invitationsCount}
                  </span>
                )}
              </button>

              <button 
                onClick={handleOpenCreateModal}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* ✅ Simple Loading State - Only spinner, no progress bar */}
          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center justify-center">
              <Loader size={48} className="text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">
                Loading {filterType === 'my' ? 'your' : 'all'} projects...
              </p>
            </div>
          )}

          {/* Initial State - Select Filter */}
          {!filterInitialized && !loading && (
            <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center justify-center">
              <Filter size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a filter to begin</h3>
              <p className="text-gray-500">Choose "All Projects" or "My Projects" to view projects</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => {
                  hasFetchedRef.current = false;
                  fetchProjects();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {filterInitialized && !loading && !error && (
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

                        {/* ✅ Removed member count section, only show menu button */}
                        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
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

      {/* Scroll to Top Button - Always visible */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>

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

      {/* Invitations Modal */}
      {showInvitationsModal && (
        <div className="modal-overlay" onClick={() => setShowInvitationsModal(false)}>
          <div
            className="invitations-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invitations-modal-header">
              <div className="header-title">
                <Mail size={24} className="text-purple-500" />
                <h2>Project Invitations</h2>
                {invitations.length > 0 && (
                  <span className="invitation-count-badge">
                    {invitations.length}
                  </span>
                )}
              </div>
              <button 
                className="close-button" 
                onClick={() => setShowInvitationsModal(false)}
                disabled={invitationsProcessing}
              >
                <X size={24} />
              </button>
            </div>

            <div className="invitations-modal-body">
              {invitationsLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading invitations...</p>
                </div>
              ) : invitationsError && invitations.length === 0 ? (
                <div className="error-container">
                  <AlertCircle size={48} className="error-icon" />
                  <p className="error-message">{invitationsError}</p>
                  <button onClick={fetchInvitations} className="retry-button">
                    Try Again
                  </button>
                </div>
              ) : invitations.length === 0 ? (
                <div className="empty-state">
                  <Mail size={64} className="empty-icon" />
                  <h3>No pending invitations</h3>
                  <p>You don't have any project invitations at the moment</p>
                </div>
              ) : (
                <>
                  <div className="invitations-list">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className={`invitation-item ${
                          selectedInvitationId === invitation.id ? 'selected' : ''
                        }`}
                        onClick={() => !invitationsProcessing && handleInvitationClick(invitation.id)}
                      >
                        <div className="invitation-icon">
                          <Users size={20} />
                        </div>

                        <div className="invitation-details">
                          <h4 className="project-name">{invitation.project.name}</h4>
                          <div className="invitation-meta">
                            <span className="invited-by">
                              Invited by <strong>{invitation.invitedBy.fullName}</strong>
                            </span>
                            {invitation.role && (
                              <span className="role-badge">{invitation.role}</span>
                            )}
                          </div>
                          <div className="invitation-time">
                            <Clock size={14} />
                            <span>{formatDate(invitation.invitedAt)}</span>
                          </div>
                        </div>

                        {selectedInvitationId === invitation.id && (
                          <div className="selection-check">
                            <Check size={20} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedInvitationId && (
                    <div className="action-section">
                      <p className="action-label">Choose your action:</p>
                      <div className="action-buttons">
                        <button
                          className={`action-button accept ${
                            selectedAction === 'accept' ? 'active' : ''
                          }`}
                          onClick={() => handleActionChange('accept')}
                          disabled={invitationsProcessing}
                        >
                          <Check size={18} />
                          Accept
                        </button>
                        <button
                          className={`action-button reject ${
                            selectedAction === 'reject' ? 'active' : ''
                          }`}
                          onClick={() => handleActionChange('reject')}
                          disabled={invitationsProcessing}
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {invitations.length > 0 && selectedInvitationId && (
              <div className="invitations-modal-footer">
                {invitationsError && (
                  <p className="error-message-inline">{invitationsError}</p>
                )}
                <div className="footer-actions">
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setSelectedInvitationId(null);
                      setSelectedAction(null);
                    }}
                    disabled={invitationsProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm-button"
                    onClick={handleConfirmInvitation}
                    disabled={invitationsProcessing || !selectedAction}
                  >
                    {invitationsProcessing ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;