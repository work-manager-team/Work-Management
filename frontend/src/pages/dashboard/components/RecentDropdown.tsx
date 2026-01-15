// components/RecentDropdown.tsx
// Component nhỏ gọn để hiển thị trong navbar/header

import React, { useState, useEffect, useRef } from 'react';
import { Clock, FolderOpen, CheckSquare, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import recentActivityService, { RecentActivity } from '../../../services/user/recentActivity.service';
import './RecentDropdown.css';

const RecentDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [recentItems, setRecentItems] = useState<RecentActivity[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadRecentItems();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadRecentItems = () => {
    const items = recentActivityService.getRecentItems(8);
    setRecentItems(items);
  };

  const handleItemClick = (item: RecentActivity) => {
    setIsOpen(false);

    if (item.type === 'project') {
      // Track again khi click từ dropdown
      recentActivityService.trackProjectView({
        id: item.id,
        name: item.name,
        description: item.description
      });
      navigate(`/project/${item.id}/board`);
    } else if (item.type === 'task') {
      recentActivityService.trackTaskView({
        id: item.id,
        title: item.name,
        status: item.status,
        projectId: item.projectId,
        projectName: item.projectName
      });
      
      if (item.projectId) {
        navigate(`/project/${item.projectId}/task/${item.id}`);
      } else {
        navigate(`/task/${item.id}`);
      }
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/recent'); // Or navigate to dashboard
  };

  return (
    <div className="recent-dropdown" ref={dropdownRef}>
      <button
        className="recent-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Recent items"
      >
        <Clock size={20} />
        <span className="recent-trigger-text">Recent</span>
      </button>

      {isOpen && (
        <div className="recent-dropdown-menu">
          <div className="dropdown-header">
            <h3>Recent</h3>
          </div>

          {recentItems.length === 0 ? (
            <div className="dropdown-empty">
              <Clock size={32} />
              <p>No recent activity</p>
            </div>
          ) : (
            <>
              <div className="dropdown-items">
                {recentItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="dropdown-item"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="item-icon-small">
                      {item.type === 'project' ? (
                        <FolderOpen size={16} />
                      ) : (
                        <CheckSquare size={16} />
                      )}
                    </div>

                    <div className="item-info">
                      <div className="item-name-small">{item.name}</div>
                      <div className="item-meta-small">
                        {item.projectName && (
                          <span className="meta-project">{item.projectName} •</span>
                        )}
                        <span className="meta-time">
                          {recentActivityService.getTimeAgo(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dropdown-footer">
                <button onClick={handleViewAll} className="view-all-link">
                  View all recent
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentDropdown;