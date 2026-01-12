import React, { useEffect, useState, useMemo, useRef } from 'react';
import { X, User, UserPlus, Trash2, Check, Filter } from 'lucide-react';
import projectService, { ProjectMember, User as UserType } from '../../../services/user/project.service';
import './ProjectMembersModal.css';
import authService from '../../../services/user/auth.service';
import AddMemberModal from './AddMemberModal';


interface ProjectMembersModalProps {
  projectId: number;
  projectName: string;
  onClose: () => void;
}

interface MemberWithDetails extends ProjectMember {
  fullName?: string;
  avatarUrl?: string;
  inviterName?: string;
}

interface RoleChange {
  userId: number;
  newRole: string;
  oldRole: string;
}

const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  projectId,
  projectName,
  onClose,
}) => {
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);
  // State cho role changes
  const [roleDropdownUserId, setRoleDropdownUserId] = useState<number | null>(null);
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Map<number, RoleChange>>(new Map());
  const [savingRoles, setSavingRoles] = useState(false);
  // State cho filter member
  const [filterStatus, setFilterStatus] = useState<'all' | 'active'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  // Ref cho dropdown (để close khi click outside)
  const dropdownRef = useRef<HTMLDivElement>(null);
  // các role có thể chọn
  const AVAILABLE_ROLES = ['admin', 'member', 'viewer'];
  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  // close dropdown khi click ra ngoài
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setRoleDropdownUserId(null);
    }
  };
  
  if (roleDropdownUserId !== null) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
  }, [roleDropdownUserId]);

  // close dropdown filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  

  const fetchMembers = async (status: 'all' | 'active' = filterStatus) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      // Get current user
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Lưu current userId
      setCurrentUserId(currentUser.id);
      
      // Fetch project members
      let projectMembers: ProjectMember[];
      if (status === 'active') {
        const response = await fetch(
        `https://work-management-chi.vercel.app/projects/${projectId}/members/active`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch active members');
      }
      
      projectMembers = await response.json();
      }
      else {
        const response = await fetch(
          `https://work-management-chi.vercel.app/projects/${projectId}/members`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized. Please login again.');
          }
          throw new Error('Failed to fetch members');
        }
        
        projectMembers = await response.json();
      
      }
      
      // Find current user's role in the project
      const currentMember = projectMembers.find(m => m.userId === currentUser.id);
      if (currentMember) {
        setCurrentUserRole(currentMember.role.toLowerCase());
      }

      // Fetch user details for each member
      const membersWithDetails = await Promise.all(
        projectMembers.map(async (member) => {
          try {
            // Fetch member's user info
            const userInfo = await projectService.getUserById(member.userId);
            
            // Fetch inviter's user info if exists
            let inviterName = 'N/A';
            if (member.invitedBy) {
              try {
                const inviterInfo = await projectService.getUserById(member.invitedBy);
                inviterName = inviterInfo.fullName;
              } catch (err) {
                console.error('Error fetching inviter info:', err);
              }
            }

            return {
              ...member,
              fullName: userInfo.fullName,
              avatarUrl: userInfo.avatarUrl,
              inviterName,
            };
          } catch (err) {
            console.error(`Error fetching details for user ${member.userId}:`, err);
            return {
              ...member,
              fullName: 'Unknown User',
              avatarUrl: undefined,
              inviterName: 'N/A',
            };
          }
        })
      );

      setMembers(membersWithDetails);
    } catch (err: any) {
      console.error('Error fetching members:', err);
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const activeCount = useMemo(() => {
  return members.filter(m => m.status.toLowerCase() === 'active').length;
  }, [members]);

  const getRoleBadgeClass = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower === 'owner' || roleLower === 'admin') return 'role-admin';
    if (roleLower === 'member') return 'role-member';
    if (roleLower === 'viewer') return 'role-viewer';
    return 'role-default';
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'status-active';
    if (statusLower === 'inactive') return 'status-inactive';
    if (statusLower === 'pending') return 'status-pending';
    return 'status-default';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if current user can add members (admin or owner role)
  const canAddMembers = currentUserRole === 'admin' || currentUserRole === 'member';
  // Check if current user can delete members (only admin)
  const canDeleteMembers = currentUserRole === 'admin';
  const handleAddMemberSuccess = () => {
    // Refresh members list after adding new members
    fetchMembers();
  };

  // Check if a member can be deleted
  const canDeleteMember = (member: MemberWithDetails): boolean => {
    // Only admin can delete
    if (!canDeleteMembers) return false;

    // Can't delete yourself
    if (member.userId === currentUserId) return false;

    // Can only delete members with status active or invited
    const status = member.status.toLowerCase();
    return status === 'active' || status === 'invited';
  };

  // Handle delete button click - show confirmation
  const handleDeleteClick = (userId: number) => {
  setConfirmDeleteUserId(userId);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async (userId: number) => {
    setDeletingUserId(userId);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `https://work-management-chi.vercel.app/projects/${projectId}/members/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete member: ${response.statusText}`);
      }

      // Success - refresh members list
      await fetchMembers();

      
    } catch (err: any) {
      console.error('Error deleting member:', err);
      setError(err.message || 'Failed to delete member. Please try again.');
    } finally {
      setDeletingUserId(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setConfirmDeleteUserId(null);
  };

  // Get existing member IDs (only admin, member active)
  const existingMemberIds = members
    .filter(m => {
      const status = m.status.toLowerCase();
      return status === 'active' || status === 'invited';
    })
    .map(m => m.userId);
  
  
  //check quyền admin khi thay đổi role của member
  const canChangeRoles = currentUserRole === 'admin';

  const canChangeRole = (member: MemberWithDetails): boolean => {
    if (!canChangeRoles) return false;
    if (member.userId === currentUserId) return false; // Can't change own role
    const status = member.status.toLowerCase();
    return status === 'active'; // Only active members
  };
  
  //handle change role
  const handleRoleClick = (userId: number) => {
  if (roleDropdownUserId === userId) {
    setRoleDropdownUserId(null); // Close if already open
  } else {
    setRoleDropdownUserId(userId); // Open dropdown
  }
  };

  const handleRoleSelect = (userId: number, newRole: string) => {
  const member = members.find(m => m.userId === userId);
  if (!member) return;

  const oldRole = member.role;
  
  // Update UI immediately (optimistic update)
  setMembers(prevMembers =>
    prevMembers.map(m =>
      m.userId === userId ? { ...m, role: newRole } : m
    )
  );

  // Add to pending changes
  setPendingRoleChanges(prev => {
    const newChanges = new Map(prev);
    newChanges.set(userId, { userId, newRole, oldRole });
    return newChanges;
  });

  // Close dropdown
  setRoleDropdownUserId(null);
  };

  // handle save role change
  const handleSaveRoleChanges = async () => {
  if (pendingRoleChanges.size === 0) return;

  setSavingRoles(true);
  setError(null);

  try {
    // Process each role change
    for (const [userId, change] of pendingRoleChanges) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(
          `https://work-management-chi.vercel.app/projects/${projectId}/members/${userId}/role`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ role: change.newRole }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update role for user ${userId}`);
        }
      } catch (err) {
        console.error(`Error updating role for user ${userId}:`, err);
        // Continue with other updates even if one fails
      }
    }

    // Clear pending changes
    setPendingRoleChanges(new Map());

    // Refresh members to get accurate data
    await fetchMembers();
  } catch (err: any) {
    console.error('Error saving role changes:', err);
    setError(err.message || 'Failed to save role changes. Please try again.');
  } finally {
    setSavingRoles(false);
  }
  };

  // handle hủy change role
  const handleCancelRoleChanges = () => {
  // Revert UI changes
  setMembers(prevMembers =>
    prevMembers.map(m => {
      const pendingChange = pendingRoleChanges.get(m.userId);
      if (pendingChange) {
        return { ...m, role: pendingChange.oldRole };
      }
      return m;
    })
  );

  // Clear pending changes
  setPendingRoleChanges(new Map());
  };

  // Get current role for member (with pending changes)
  const getCurrentRole = (member: MemberWithDetails): string => {
    return member.role; // Already updated in state
  };

  // handle filter member
  const handleFilterChange = async (status: 'all' | 'active') => {
    setFilterStatus(status);
    setShowFilterDropdown(false);
    await fetchMembers(status);
  };
  return (
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content members-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Project Members</h2>
            <p className="project-name">{projectName}</p>
          </div>

          <div className="header-actions">
              {/* Show buttons khi có pending changes */}
              {pendingRoleChanges.size > 0 && (
                <>
                  <button
                    className="cancel-role-button"
                    onClick={handleCancelRoleChanges}
                    disabled={savingRoles}
                  >
                    Hủy
                  </button>
                  <button
                    className="save-role-button"
                    onClick={handleSaveRoleChanges}
                    disabled={savingRoles}
                  >
                    {savingRoles ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </>
              )}

              {/*button filter member*/}
              {!loading && (
              <div className="filter-container" ref={filterDropdownRef}>
                <button
                  className="filter-button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  title="Filter Members"
                >
                  <Filter size={20} />
                  <span className="filter-label">{filterStatus === 'all' ? 'All' : 'Active'}</span>
                </button>
                
                {showFilterDropdown && (
                  <div className="filter-dropdown">
                    <div
                      className={`filter-option ${filterStatus === 'all' ? 'selected' : ''}`}
                      onClick={() => handleFilterChange('all')}
                    >
                      <span>All</span>
                      {filterStatus === 'all' && <Check size={16} className="check-icon" />}
                    </div>
                    <div
                      className={`filter-option ${filterStatus === 'active' ? 'selected' : ''}`}
                      onClick={() => handleFilterChange('active')}
                    >
                      <span>Active</span>
                      {filterStatus === 'active' && <Check size={16} className="check-icon" />}
                    </div>
                  </div>
                )}
              </div>
              )}
              {canAddMembers && !loading && (
                <button
                  className="add-member-button"
                  onClick={() => setShowAddMemberModal(true)}
                  title="Add Member"
                >
                  <UserPlus size={20} />
                </button>
              )}
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
      </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading members...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={() => fetchMembers()} className="retry-button">
                Try Again
              </button>
            </div>
          ) : members.length === 0 ? (
            <div className="empty-state">
              <User size={64} className="empty-icon" />
              <h3>No members found</h3>
              <p>This project doesn't have any members yet</p>
            </div>
          ) : (
            <div className="members-table-container">
              <table className="members-table">
                <thead>
                  <tr>
                    
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Invited By</th>
                    <th>Joined At</th>
                    {canDeleteMembers && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const currentRole = getCurrentRole(member);
                    const hasRoleChange = pendingRoleChanges.has(member.userId);

                    return (
                      <tr key={member.userId} className={hasRoleChange ? 'role-changed' : ''}>
                        <td className='member-info'>
                          <div className="member-avatar-name">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.fullName}
                                className="member-avatar"
                              />
                            ) : (
                              <div className="member-avatar-placeholder">
                                <User size={20} />
                              </div>
                            )}
                            <span className="member-name">{member.fullName}</span>
                          </div>
                        </td>
                        <td className="role-cell">
                          {canChangeRole(member) ? (
                            <div className="role-selector" ref={roleDropdownUserId === member.userId ? dropdownRef : null}>
                              {/* Clickable badge */}
                              <button
                                className={`role-badge ${getRoleBadgeClass(currentRole)} clickable ${hasRoleChange ? 'changed' : ''}`}
                                onClick={() => handleRoleClick(member.userId)}
                                disabled={savingRoles}
                              >
                                {currentRole}
                              </button>
                              
                              {/* Dropdown menu */}
                              {roleDropdownUserId === member.userId && (
                                <div className="role-dropdown">
                                  {AVAILABLE_ROLES.map((role) => (
                                    <div
                                      key={role}
                                      className={`role-option ${currentRole.toLowerCase() === role ? 'selected' : ''}`}
                                      onClick={() => handleRoleSelect(member.userId, role)}
                                    >
                                      <span>{role}</span>
                                      {currentRole.toLowerCase() === role && (
                                        <Check size={16} className="check-icon" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Non-clickable badge */
                            <span className={`role-badge ${getRoleBadgeClass(currentRole)}`}>
                              {currentRole}
                            </span>
                          )}
                        </td>
                        
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="inviter-name">{member.inviterName}</td>
                        <td className="joined-date">{formatDate(member.joinedAt)}</td>
                        {canDeleteMembers && (
                          <td className="member-actions">
                          {canDeleteMember(member) ? (
                            <div className="action-cell">
                              {/* Nếu đang confirm userId này */}
                              {confirmDeleteUserId === member.userId ? (
                                // Hiện 2 buttons: Xác nhận | Hủy
                                <div className="inline-confirm">
                                  <button
                                    className="confirm-yes-button"
                                    onClick={() => handleConfirmDelete(member.userId)}
                                    disabled={deletingUserId === member.userId}
                                  >
                                    {deletingUserId === member.userId ? '...' : 'Xác nhận'}
                                  </button>
                                  <button
                                    className="confirm-no-button"
                                    onClick={handleCancelDelete}
                                    disabled={deletingUserId === member.userId}
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                // Hiện button Trash
                                <button
                                  className="delete-member-button"
                                  onClick={() => handleDeleteClick(member.userId)}
                                  disabled={deletingUserId !== null}
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="no-action"></span>
                          )}
                        </td>
                      
                        )}
                      
                      

                      </tr>
                    );
                    
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && members.length > 0 && (
          <div className="modal-footer">
            <p className="members-count">
              Total: {activeCount} member{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
    

    {/* Add Member Modal */}
    {showAddMemberModal && (
      <AddMemberModal
        projectId={projectId}
        existingMemberIds={existingMemberIds}
        onClose={() => setShowAddMemberModal(false)}
        onSuccess={handleAddMemberSuccess}
      />
    )}
    </>
  );
};

export default ProjectMembersModal;