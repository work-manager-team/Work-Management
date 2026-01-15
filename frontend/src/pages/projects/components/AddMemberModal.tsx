import React, { useEffect, useState } from 'react';
import { X, User, Search, Check } from 'lucide-react';
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
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
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

  const toggleUserSelection = (userId: number) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const handleAddMembers = async () => {
    if (selectedUserIds.size === 0) {
      setError('Please select at least one user to add');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      // Add members one by one
      const promises = Array.from(selectedUserIds).map(userId =>
        projectService.addProjectMember(projectId, userId, 'member')
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
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`user-item ${
                    selectedUserIds.has(user.id) ? 'selected' : ''
                  }`}
                  onClick={() => !adding && toggleUserSelection(user.id)}
                >
                  <div className="user-info">
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
                  <div className="selection-indicator">
                    {selectedUserIds.has(user.id) && (
                      <Check size={20} className="check-icon" />
                    )}
                  </div>
                </div>
              ))}
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
              {selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''}{' '}
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
                disabled={adding || selectedUserIds.size === 0}
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