import React, { useState, useEffect } from 'react';
import { X, Settings, Trash2 } from 'lucide-react';
import { ProjectDetails } from '../../../services/user/project.service';
import './ProjectSettingsModal.css';

interface ProjectSettingsModalProps {
  project: ProjectDetails;
  onClose: () => void;
  onUpdate: (updatedProject: ProjectDetails) => void;
  onDelete: () => void;
}

interface ProjectFormData {
  name: string;
  key: string;
  description: string;
  status: string;
  visibility: string;
  startDate: string;
  endDate: string;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  project,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: project.name,
    key: project.key,
    description: project.description || '',
    status: project.status,
    visibility: project.visibility,
    startDate: project.startDate.split('T')[0], // Format to YYYY-MM-DD
    endDate: project.endDate.split('T')[0],
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // state lỗi datetime
  const [dateError, setDateError] = useState<string | null>(null);

  // Status options
  const STATUS_OPTIONS = ['Planning', 'Active', 'Completed', 'On Hold', 'Archived'];
  
  // Visibility options
  const VISIBILITY_OPTIONS = ['Public', 'Private', 'Team'];
  // hàm validate datetime
  // Validate dates: createdDate <= startDate <= endDate
    const validateDates = (startDate: string, endDate: string): string | null => {
    const createdDate = new Date(project.createdAt.split('T')[0]);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if start date is before created date
    if (start < createdDate) {
        return `Start Date cannot be before Created Date (${formatDateForDisplay(project.createdAt)})`;
    }

    // Check if end date is before start date
    if (end < start) {
        return 'End Date cannot be before Start Date';
    }

    return null; // Valid
    };

    // Helper function to format date for display
    const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    };
  // Check for changes
  useEffect(() => {
    const hasChanged =
      formData.name !== project.name ||
      formData.key !== project.key ||
      formData.description !== (project.description || '') ||
      formData.status !== project.status ||
      formData.visibility !== project.visibility ||
      formData.startDate !== project.startDate.split('T')[0] ||
      formData.endDate !== project.endDate.split('T')[0];

    setHasChanges(hasChanged);

    const error = validateDates(formData.startDate, formData.endDate);
    setDateError(error);
  }, [formData, project]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (dateError) {
        setError(dateError);
        return;
    }
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `https://work-management-chi.vercel.app/projects/${project.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            key: formData.key,
            description: formData.description,
            status: formData.status.toLowerCase().replace(/\s+/g, '_'),
            visibility: formData.visibility.toLowerCase(),
            startDate: formData.startDate,
            endDate: formData.endDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      onUpdate(updatedProject);
      onClose();
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: project.name,
      key: project.key,
      description: project.description || '',
      status: project.status,
      visibility: project.visibility,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
    });
    setHasChanges(false);
    setDateError(null); // Reset date error
    setError(null);
  };

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `https://work-management-chi.vercel.app/projects/${project.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      onDelete();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-modal-header">
          <div className="settings-header-title">
            <Settings size={24} />
            <h2>Project Settings</h2>
          </div>
          <button className="settings-close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="settings-modal-body">
          {error && (
            <div className="settings-error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Date Validation Error - hiển thị riêng */}
          {dateError && !error && (
                <div className="settings-warning-message">
                <p>{dateError}</p>
                </div>
           )}
          <div className="settings-form">
            {/* Project Name */}
            <div className="form-group">
              <label htmlFor="name">Project Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter project name"
                required
              />
            </div>

            {/* Project Key */}
            <div className="form-group">
              <label htmlFor="key">Project Key *</label>
              <input
                type="text"
                id="key"
                name="key"
                value={formData.key}
                onChange={handleInputChange}
                placeholder="e.g., PROJ"
                required
                maxLength={10}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter project description"
                rows={4}
              />
            </div>

            {/* Status and Visibility Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="visibility">Visibility *</label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  required
                >
                  {VISIBILITY_OPTIONS.map((visibility) => (
                    <option key={visibility} value={visibility}>
                      {visibility}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Date and End Date Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-modal-footer">
          <div className="footer-left">
            {hasChanges && (
              <>
                <button
                  className="cancel-changes-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  className="save-changes-button"
                  onClick={handleSave}
                  disabled={saving || dateError !== null}
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </>
            )}
          </div>

          <div className="footer-right">
            {confirmDelete ? (
              <div className="delete-confirm-buttons">
                <button
                  className="confirm-delete-button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? '...' : 'Xác nhận'}
                </button>
                <button
                  className="cancel-delete-button"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                className="delete-project-button"
                onClick={handleDeleteClick}
                disabled={saving}
              >
                <Trash2 size={18} />
                Delete Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;