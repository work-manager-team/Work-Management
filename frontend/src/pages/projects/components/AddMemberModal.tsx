import React, { useEffect, useState } from 'react';
import { X, User, Search, Check, ChevronDown } from 'lucide-react';
import projectService, { User as UserType } from '../../../services/user/project.service';
import authService from '../../../services/user/auth.service';
import './AddMemberModal.css';

interface AddMemberModalProps {
  projectId: number;
  existingMemberIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  projectId,
  existingMemberIds,
  onClose,
  onSuccess,
}) => {
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  
  // ✅ THAY ĐỔI: Dùng Map để lưu userId và role
  const [selectedUsers, setSelectedUsers] = useState<Map<number, string>>(new Map());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query (by email)
    if (searchQuery.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allUsers.filter(user =>
        user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const fetchAvailableUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all users
      const users = await projectService.getAllUsers();

      // Filter out users who are already members (admin or member role)
      const availableUsers = users.filter(
        user => !existingMemberIds.includes(user.id)
      );

      setAllUsers(availableUsers);
      setFilteredUsers(availableUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // ✅ THAY ĐỔI: Toggle user selection với role mặc định là 'member'
  const toggleUserSelection = (userId: number) => {
    const newSelection = new Map(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.set(userId, 'member'); // Default role
    }
    setSelectedUsers(newSelection);
  };

  // ✅ MỚI: Hàm thay đổi role của user
  const handleRoleChange = (userId: number, newRole: string) => {
    const newSelection = new Map(selectedUsers);
    newSelection.set(userId, newRole);
    setSelectedUsers(newSelection);
  };

  const handleAddMembers = async () => {
    if (selectedUsers.size === 0) {
      setError('Please select at least one user to add');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      // ✅ THAY ĐỔI: Add members với role tương ứng
      const promises = Array.from(selectedUsers.entries()).map(([userId, role]) =>
        projectService.addProjectMember(projectId, userId, role)
      );

      await Promise.all(promises);

      // Success - close modal and refresh parent
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding members:', err);
      setError(err.message || 'Failed to add members. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content add-member-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>Add Members</h2>
          <button className="close-button" onClick={onClose} disabled={adding}>
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            disabled={loading || adding}
          />
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : error && allUsers.length === 0 ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={fetchAvailableUsers} className="retry-button">
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <User size={64} className="empty-icon" />
              <h3>No users found</h3>
              <p>
                {searchQuery
                  ? 'No users match your search criteria'
                  : 'All users are already members of this project'}
              </p>
            </div>
          ) : (
            <div className="users-list">
              {filteredUsers.map((user) => {
                const isSelected = selectedUsers.has(user.id);
                const userRole = selectedUsers.get(user.id) || 'member';

                return (
                  <div
                    key={user.id}
                    className={`user-item ${isSelected ? 'selected' : ''}`}
                  >
                    {/* ✅ User Info - Clickable để toggle selection */}
                    <div
                      className="user-info"
                      onClick={() => !adding && toggleUserSelection(user.id)}
                      style={{ cursor: adding ? 'default' : 'pointer', flex: 1 }}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="user-avatar"
                        />
                      ) : (
                        <div className="user-avatar-placeholder">
                          <User size={20} />
                        </div>
                      )}
                      <div className="user-details">
                        <span className="user-name">{user.fullName}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>

                    {/* ✅ MỚI: Role Dropdown - Chỉ hiển thị khi user được chọn */}
                    {isSelected && (
                      <div 
                        className="role-selector"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          marginRight: '12px',
                          position: 'relative',
                        }}
                      >
                        <select
                          value={userRole}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={adding}
                          style={{
                            padding: '6px 32px 6px 12px',
                            fontSize: '14px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            cursor: adding ? 'not-allowed' : 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 8px center',
                            outline: 'none',
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    )}

                    {/* Selection Indicator */}
                    <div className="selection-indicator">
                      {isSelected && (
                        <Check size={20} className="check-icon" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {error && allUsers.length > 0 && (
            <p className="error-message-inline">{error}</p>
          )}
          <div className="footer-actions">
            <p className="selected-count">
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''}{' '}
              selected
            </p>
            <div className="button-group">
              <button
                className="cancel-button"
                onClick={onClose}
                disabled={adding}
              >
                Cancel
              </button>
              <button
                className="add-button"
                onClick={handleAddMembers}
                disabled={adding || selectedUsers.size === 0}
              >
                {adding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;