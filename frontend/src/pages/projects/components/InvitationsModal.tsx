import React, { useState, useEffect } from 'react';
import { X, Mail, Users, Check, XCircle, Clock, AlertCircle } from 'lucide-react';
import { apiCall } from '../../../utils/api';
import './InvitationsModal.css';

interface Invitation {
  id: number;
  projectId: number;
  projectName: string;
  invitedBy: string; // fullName of inviter
  invitedByEmail?: string;
  invitedAt: string;
  status: string;
  role?: string;
}

interface InvitationsModalProps {
  onClose: () => void;
  onInvitationHandled: () => void; // Callback to refresh projects list
}

const InvitationsModal: React.FC<InvitationsModalProps> = ({
  onClose,
  onInvitationHandled,
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Selected invitation and action
  const [selectedInvitationId, setSelectedInvitationId] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('https://work-management-chi.vercel.app/projects/my-invitations', {
        method: 'GET',
      });

      // Check for auth errors (401, 403)
      if (response.status === 401 || response.status === 403) {
        setError('Your session has expired. Please refresh the page.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }

      const data = await response.json();
      setInvitations(data);
    } catch (err: any) {
      console.error('Error fetching invitations:', err);
      setError(err.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationClick = (invitationId: number) => {
    if (selectedInvitationId === invitationId) {
      // Deselect if clicking the same invitation
      setSelectedInvitationId(null);
      setSelectedAction(null);
    } else {
      setSelectedInvitationId(invitationId);
      setSelectedAction(null); // Reset action when selecting different invitation
    }
  };

  const handleActionChange = (action: 'accept' | 'reject') => {
    setSelectedAction(action);
  };

  const handleConfirm = async () => {
    if (!selectedInvitationId || !selectedAction) {
      setError('Please select an action (Accept or Reject)');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const endpoint = selectedAction === 'accept' 
        ? `https://work-management-chi.vercel.app/project-invitations/${selectedInvitationId}/accept`
        : `https://work-management-chi.vercel.app/project-invitations/${selectedInvitationId}/reject`;

      const response = await apiCall(endpoint, {
        method: 'POST',
      });

      // Check for auth errors
      if (response.status === 401 || response.status === 403) {
        setError('Your session has expired. Please refresh the page.');
        setProcessing(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to ${selectedAction} invitation`);
      }

      // Success - remove the invitation from list
      setInvitations(prev => prev.filter(inv => inv.id !== selectedInvitationId));
      setSelectedInvitationId(null);
      setSelectedAction(null);

      // Notify parent to refresh projects list
      onInvitationHandled();

      // Close modal if no more invitations
      if (invitations.length === 1) {
        setTimeout(() => onClose(), 500);
      }
    } catch (err: any) {
      console.error(`Error ${selectedAction}ing invitation:`, err);
      setError(err.message || `Failed to ${selectedAction} invitation. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="invitations-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            onClick={onClose}
            disabled={processing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="invitations-modal-body">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading invitations...</p>
            </div>
          ) : error && invitations.length === 0 ? (
            <div className="error-container">
              <AlertCircle size={48} className="error-icon" />
              <p className="error-message">{error}</p>
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
                    onClick={() => !processing && handleInvitationClick(invitation.id)}
                  >
                    <div className="invitation-icon">
                      <Users size={20} />
                    </div>

                    <div className="invitation-details">
                      <h4 className="project-name">{invitation.projectName}</h4>
                      <div className="invitation-meta">
                        <span className="invited-by">
                          Invited by <strong>{invitation.invitedBy}</strong>
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

              {/* Action Selection */}
              {selectedInvitationId && (
                <div className="action-section">
                  <p className="action-label">Choose your action:</p>
                  <div className="action-buttons">
                    <button
                      className={`action-button accept ${
                        selectedAction === 'accept' ? 'active' : ''
                      }`}
                      onClick={() => handleActionChange('accept')}
                      disabled={processing}
                    >
                      <Check size={18} />
                      Accept
                    </button>
                    <button
                      className={`action-button reject ${
                        selectedAction === 'reject' ? 'active' : ''
                      }`}
                      onClick={() => handleActionChange('reject')}
                      disabled={processing}
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

        {/* Footer */}
        {invitations.length > 0 && selectedInvitationId && (
          <div className="invitations-modal-footer">
            {error && (
              <p className="error-message-inline">{error}</p>
            )}
            <div className="footer-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setSelectedInvitationId(null);
                  setSelectedAction(null);
                }}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={handleConfirm}
                disabled={processing || !selectedAction}
              >
                {processing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsModal;