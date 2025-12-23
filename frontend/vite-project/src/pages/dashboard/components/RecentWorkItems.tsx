import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Camera } from 'lucide-react';
import issueService from '../../../services/user/issue.service';
import { Issue } from '../../../models/Issue';
import './recentWorkItems.css';

interface RecentWorkItemsProps {
  userId: string;
}

const RecentWorkItems: React.FC<RecentWorkItemsProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'worked' | 'viewed' | 'assigned' | 'starred' | 'boards'>('worked');
  const [workItems, setWorkItems] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkItems();
  }, [activeTab, userId]);

  const fetchWorkItems = async () => {
    setLoading(true);
    try {
      // Fetch work items based on active tab
      let items: Issue[] = [];
      
      switch (activeTab) {
        case 'worked':
          items = await issueService.getWorkedOnIssues(userId);
          break;
        case 'assigned':
          items = await issueService.getAssignedIssues(userId);
          break;
        // Add other cases as needed
        default:
          items = [];
      }
      
      setWorkItems(items);
    } catch (error) {
      console.error('Error fetching work items:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'worked', label: 'Worked on' },
    { key: 'viewed', label: 'Viewed' },
    { key: 'assigned', label: 'Assigned to me', count: 0 },
    { key: 'starred', label: 'Starred' },
    { key: 'boards', label: 'Boards' },
  ];

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare size={16} className="issue-icon task" />;
      case 'story':
        return <Square size={16} className="issue-icon story" />;
      case 'bug':
        return <Camera size={16} className="issue-icon bug" />;
      default:
        return <Square size={16} className="issue-icon" />;
    }
  };

  return (
    <div className="recent-work-items">
      {/* Tabs */}
      <div className="work-items-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`work-item-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Work Items List */}
      <div className="work-items-content">
        {loading ? (
          <div className="work-items-loading">Loading...</div>
        ) : workItems.length > 0 ? (
          <>
            <div className="work-items-group-header">MORE THAN A MONTH AGO</div>
            {workItems.map((item) => (
              <div key={item.id} className="work-item">
                <div className="work-item-left">
                  {getIssueIcon(item.type)}
                  <div className="work-item-info">
                    <h4 className="work-item-title">{item.title}</h4>
                    <p className="work-item-meta">
                      {item.key} · {item.projectName}
                    </p>
                  </div>
                </div>
                <div className="work-item-right">
                  <span className="work-item-status">Created</span>
                  <div className="work-item-avatar">
                    {item.reporter?.avatar ? (
                      <img src={item.reporter.avatar} alt={item.reporter.name} />
                    ) : (
                      <span>{item.reporter?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="work-items-empty">
            <p>No work items to display</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default RecentWorkItems;