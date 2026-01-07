import React, { useEffect, useState } from 'react';
import { X, User, UserPlus } from 'lucide-react';
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

const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  projectId,
  projectName,
  onClose,
}) => {
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  
  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      // Fetch project members
      const projectMembers = await projectService.getProjectMembers(projectId);
      
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

  const handleAddMemberSuccess = () => {
    // Refresh members list after adding new members
    fetchMembers();
  };

  // Get existing member IDs (only admin, member, and owner roles)
  const existingMemberIds = members
    .filter(m => {
      const status = m.status.toLowerCase();
      return status === 'active';
    })
    .map(m => m.userId);

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
              <button onClick={fetchMembers} className="retry-button">
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
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.userId}>
                      
                      <td className="member-info">
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
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="inviter-name">{member.inviterName}</td>
                      <td className="joined-date">{formatDate(member.joinedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && members.length > 0 && (
          <div className="modal-footer">
            <p className="members-count">
              Total: {members.length} member{members.length !== 1 ? 's' : ''}
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